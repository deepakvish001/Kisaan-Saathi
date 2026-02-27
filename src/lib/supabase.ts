import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Crop {
  id: string;
  name_en: string;
  name_hi: string;
  growth_stages: Array<{
    stage: string;
    en: string;
    hi: string;
  }>;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Advisory {
  id: string;
  diseaseName: string;
  description: string;
  treatment: string;
  prevention: string;
  confidenceScore: number;
  confidenceLevel: string;
  actionSteps: Array<{ step: number; action: string }>;
  escalated: boolean;
  recommendationText: string;
}

export interface SoilProfile {
  id: string;
  soil_type: string;
  organic_matter: string;
  ph_level?: number;
  nitrogen_level?: string;
  phosphorus_level?: string;
  potassium_level?: string;
}

export interface IrrigationProfile {
  id: string;
  water_source: string;
  irrigation_method: string;
  water_quality: string;
  water_availability: string;
}

export interface FieldProfile {
  id: string;
  field_name: string;
  area?: number;
  slope: string;
  drainage: string;
  sun_exposure: string;
  soil_profile?: SoilProfile;
  irrigation_profile?: IrrigationProfile;
}

export interface FarmProfile {
  id: string;
  user_id: string;
  farm_name: string;
  total_area?: number;
  location?: string;
  farm_type: string;
  is_default: boolean;
  fields?: FieldProfile[];
}

export async function fetchCrops(): Promise<Crop[]> {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .order('name_en');

  if (error) throw error;
  return data || [];
}

export async function sendMessage(
  sessionId: string,
  message: string,
  language: string,
  cropId?: string,
  growthStage?: string,
  location?: string,
  farmProfileId?: string,
  fieldProfileId?: string
) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  console.log('=== SUPABASE.TS SESSION CHECK ===');
  console.log('Has session:', !!session);
  console.log('Has access token:', !!session?.access_token);
  console.log('Session error:', sessionError?.message);
  console.log('Token expiry:', session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A');
  console.log('Current time:', new Date().toISOString());
  console.log('User ID:', session?.user?.id);
  console.log('Token preview:', session?.access_token ? session.access_token.substring(0, 20) + '...' : 'N/A');
  console.log('==================================');

  if (sessionError || !session?.access_token) {
    throw new Error('Unauthorized - Please log in');
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/chat-orchestrator`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        sessionId,
        message,
        language,
        cropId,
        growthStage,
        location,
        farmProfileId,
        fieldProfileId,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Status:', response.status);
    console.error('Status text:', response.statusText);
    console.error('Error data:', JSON.stringify(errorData, null, 2));
    console.error('Error message:', errorData.error);
    console.error('Error details:', errorData.details);
    console.error('==========================');

    if (response.status === 401) {
      const details = errorData.details || errorData.error || 'Please log in';
      throw new Error(`Unauthorized - ${details}`);
    }
    throw new Error(errorData.error || 'Failed to send message');
  }

  return response.json();
}

export async function generateAdvisory(
  conversationId: string,
  language: string
): Promise<{ advisory: Advisory }> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('Unauthorized - Please log in');
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/generate-advisory`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        conversationId,
        language,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate advisory');
  }

  return response.json();
}

export async function createFarmProfile(data: {
  farmName: string;
  totalArea?: string;
  location?: string;
  farmType: string;
  isDefault?: boolean;
}): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: result, error } = await supabase
    .from('farm_profiles')
    .insert({
      user_id: user.id,
      farm_name: data.farmName,
      total_area: data.totalArea ? parseFloat(data.totalArea) : null,
      location: data.location,
      farm_type: data.farmType,
      is_default: data.isDefault || false,
    })
    .select('id')
    .single();

  if (error) throw error;
  return result;
}

export async function createFieldProfile(data: {
  farmId: string;
  fieldName: string;
  area?: string;
  slope: string;
  drainage: string;
  sunExposure: string;
}): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: result, error } = await supabase
    .from('field_profiles')
    .insert({
      farm_id: data.farmId,
      user_id: user.id,
      field_name: data.fieldName,
      area: data.area ? parseFloat(data.area) : null,
      slope: data.slope,
      drainage: data.drainage,
      sun_exposure: data.sunExposure,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return result;
}

export async function createSoilProfile(data: {
  fieldId: string;
  soilType: string;
  organicMatter: string;
  phLevel?: string;
  nitrogenLevel?: string;
  phosphorusLevel?: string;
  potassiumLevel?: string;
}): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: result, error } = await supabase
    .from('soil_profiles')
    .insert({
      field_id: data.fieldId,
      user_id: user.id,
      soil_type: data.soilType,
      organic_matter: data.organicMatter,
      ph_level: data.phLevel ? parseFloat(data.phLevel) : null,
      nitrogen_level: data.nitrogenLevel,
      phosphorus_level: data.phosphorusLevel,
      potassium_level: data.potassiumLevel,
    })
    .select('id')
    .single();

  if (error) throw error;
  return result;
}

export async function createIrrigationProfile(data: {
  fieldId: string;
  waterSource: string;
  irrigationMethod: string;
  waterQuality: string;
  waterAvailability: string;
}): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: result, error } = await supabase
    .from('irrigation_profiles')
    .insert({
      field_id: data.fieldId,
      user_id: user.id,
      water_source: data.waterSource,
      irrigation_method: data.irrigationMethod,
      water_quality: data.waterQuality,
      water_availability: data.waterAvailability,
    })
    .select('id')
    .single();

  if (error) throw error;
  return result;
}

export async function fetchFarmProfiles(): Promise<FarmProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: farms, error: farmsError } = await supabase
    .from('farm_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (farmsError) throw farmsError;

  const farmsWithFields = await Promise.all(
    (farms || []).map(async (farm) => {
      const { data: fields, error: fieldsError } = await supabase
        .from('field_profiles')
        .select('*')
        .eq('farm_id', farm.id)
        .eq('is_active', true);

      if (fieldsError) {
        console.error('Error fetching fields:', fieldsError);
        return { ...farm, fields: [] };
      }

      const fieldsWithProfiles = await Promise.all(
        (fields || []).map(async (field) => {
          const [soilResult, irrigationResult] = await Promise.all([
            supabase
              .from('soil_profiles')
              .select('*')
              .eq('field_id', field.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('irrigation_profiles')
              .select('*')
              .eq('field_id', field.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          return {
            ...field,
            soil_profile: soilResult.data || undefined,
            irrigation_profile: irrigationResult.data || undefined,
          };
        })
      );

      return { ...farm, fields: fieldsWithProfiles };
    })
  );

  return farmsWithFields;
}

export async function updateConversationWithProfiles(
  conversationId: string,
  farmProfileId: string,
  fieldProfileId: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({
      farm_profile_id: farmProfileId,
      field_profile_id: fieldProfileId,
    })
    .eq('id', conversationId);

  if (error) throw error;
}
