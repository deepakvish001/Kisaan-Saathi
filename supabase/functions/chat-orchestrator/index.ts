import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConversationRequest {
  sessionId: string;
  message: string;
  language: string;
  cropId?: string;
  growthStage?: string;
  location?: string;
  farmProfileId?: string;
  fieldProfileId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const apikeyHeader = req.headers.get('apikey');

    console.log('Auth check:', {
      hasAuthHeader: !!authHeader,
      hasApikeyHeader: !!apikeyHeader,
      authHeaderPrefix: authHeader?.substring(0, 10)
    });

    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No token provided' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log('Attempting to get user from token...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    console.log('User check result:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!userError,
      errorMessage: userError?.message
    });

    if (userError || !user) {
      console.error('Invalid token or user not found:', {
        error: userError?.message,
        hasUser: !!user
      });
      return new Response(
        JSON.stringify({
          error: 'Unauthorized - Invalid token',
          details: userError?.message || 'User not found'
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('User authenticated successfully:', user.id);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: ConversationRequest = await req.json();
    const { sessionId, message, language, cropId, growthStage, location, farmProfileId, fieldProfileId } = body;

    let conversation = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!conversation.data) {
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          language: language || 'en',
          crop_id: cropId,
          growth_stage: growthStage,
          location: location,
          farm_profile_id: farmProfileId,
          field_profile_id: fieldProfileId,
          conversation_history: [],
          detected_symptoms: [],
          current_probabilities: {},
          status: 'active',
        })
        .select()
        .single();

      if (createError) throw createError;
      conversation.data = newConv;
    }

    let characterisationContext = null;
    if (fieldProfileId) {
      characterisationContext = await fetchCharacterisationContext(supabase, fieldProfileId);
    }

    const conversationHistory: ChatMessage[] = conversation.data.conversation_history || [];
    const detectedSymptoms: string[] = conversation.data.detected_symptoms || [];

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    conversationHistory.push(userMessage);

    const symptomMatches = await detectSymptoms(supabase, message, language, cropId);

    for (const match of symptomMatches) {
      if (!detectedSymptoms.includes(match.symptom_code)) {
        detectedSymptoms.push(match.symptom_code);
      }
    }

    const probabilities = await calculateDiseaseProbabilities(
      supabase,
      detectedSymptoms
    );

    let nextQuestion = null;
    if (detectedSymptoms.length > 0 && Object.keys(probabilities).length > 0) {
      const maxProb = Math.max(...Object.values(probabilities));

      if (maxProb < 0.75) {
        nextQuestion = await getNextQuestion(
          supabase,
          detectedSymptoms,
          conversationHistory,
          language
        );
      }
    }

    let responseText = '';

    if (conversationHistory.length === 1) {
      responseText = language === 'hi'
        ? 'मैं समझ गया। आइए इसे जल्दी से समझते हैं।'
        : "I understand. Let's quickly figure this out.";
    }

    if (symptomMatches.length > 0) {
      const symptomNames = symptomMatches.map(s =>
        language === 'hi' ? s.description_hi : s.description_en
      ).join(', ');

      const acknowledgment = language === 'hi'
        ? `मैंने देखा: ${symptomNames}`
        : `I noticed: ${symptomNames}`;

      responseText = responseText ? `${responseText}\n\n${acknowledgment}` : acknowledgment;
    }

    if (nextQuestion) {
      responseText += `\n\n${nextQuestion.question}`;
    } else if (Object.keys(probabilities).length > 0) {
      const topDisease = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0];
      const [diseaseId, confidence] = topDisease;

      const { data: diseaseData } = await supabase
        .from('diseases')
        .select('*')
        .eq('id', diseaseId)
        .single();

      if (diseaseData && confidence > 0.6) {
        responseText += language === 'hi'
          ? '\n\nमुझे लगता है कि मुझे पता चल गया है। आइए मैं आपको सिफारिश तैयार करूं।'
          : "\n\nI think I've identified it. Let me prepare a recommendation for you.";
      }
    } else if (conversationHistory.length === 1) {
      responseText += language === 'hi'
        ? '\n\nकृपया मुझे बताएं कि आपको क्या समस्या दिख रही है?'
        : '\n\nPlease tell me what problem you are seeing?';
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    };
    conversationHistory.push(assistantMessage);

    await supabase
      .from('conversations')
      .update({
        conversation_history: conversationHistory,
        detected_symptoms: detectedSymptoms,
        current_probabilities: probabilities,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    await supabase.from('user_queries').insert({
      conversation_id: conversation.data.id,
      user_id: user.id,
      query_text: message,
      language: language,
      success: true,
    });

    return new Response(
      JSON.stringify({
        response: responseText,
        detectedSymptoms: detectedSymptoms,
        probabilities: probabilities,
        nextQuestion: nextQuestion,
        conversationId: conversation.data.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in chat orchestrator:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      sessionId: body?.sessionId,
      cropId: body?.cropId,
    });
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request. Please try again.',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function detectSymptoms(
  supabase: any,
  message: string,
  language: string,
  cropId?: string
) {
  const messageLower = message.toLowerCase();

  let query = supabase.from('symptoms').select('*');

  if (cropId) {
    const { data: cropDiseases } = await supabase
      .from('diseases')
      .select('id')
      .eq('crop_id', cropId);

    if (cropDiseases && cropDiseases.length > 0) {
      const diseaseIds = cropDiseases.map((d: any) => d.id);

      const { data: relevantSymptoms } = await supabase
        .from('symptom_disease_mapping')
        .select('symptom_id')
        .in('disease_id', diseaseIds);

      if (relevantSymptoms && relevantSymptoms.length > 0) {
        const symptomIds = [...new Set(relevantSymptoms.map((s: any) => s.symptom_id))];
        query = query.in('id', symptomIds);
      }
    }
  }

  const { data: symptoms } = await query;

  const matches = [];

  for (const symptom of symptoms || []) {
    const description = language === 'hi' ? symptom.description_hi : symptom.description_en;
    const keywords = extractKeywords(description);

    for (const keyword of keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        matches.push(symptom);
        break;
      }
    }
  }

  return matches;
}

function extractKeywords(description: string): string[] {
  const words = description.split(/[\s,]+/);
  return words.filter(w => w.length > 3);
}

async function calculateDiseaseProbabilities(
  supabase: any,
  detectedSymptoms: string[]
) {
  if (detectedSymptoms.length === 0) return {};

  const { data: symptoms, error: symptomsError } = await supabase
    .from('symptoms')
    .select('id')
    .in('symptom_code', detectedSymptoms);

  if (symptomsError) {
    console.error('Error fetching symptoms:', symptomsError);
    return {};
  }

  if (!symptoms || symptoms.length === 0) return {};

  const symptomIds = symptoms.map((s: any) => s.id);

  const { data: mappings, error: mappingsError } = await supabase
    .from('symptom_disease_mapping')
    .select('disease_id, probability_weight, is_primary_indicator')
    .in('symptom_id', symptomIds);

  if (mappingsError) {
    console.error('Error fetching symptom disease mappings:', mappingsError);
    return {};
  }

  const diseaseProbabilities: Record<string, number> = {};

  for (const mapping of mappings || []) {
    const diseaseId = mapping.disease_id;
    const weight = mapping.probability_weight;

    if (!diseaseProbabilities[diseaseId]) {
      diseaseProbabilities[diseaseId] = 0;
    }

    diseaseProbabilities[diseaseId] += weight * 0.5;
  }

  for (const diseaseId in diseaseProbabilities) {
    diseaseProbabilities[diseaseId] = Math.min(diseaseProbabilities[diseaseId], 1.0);
  }

  return diseaseProbabilities;
}

async function getNextQuestion(
  supabase: any,
  detectedSymptoms: string[],
  conversationHistory: ChatMessage[],
  language: string
) {
  const askedQuestions = conversationHistory
    .filter(m => m.role === 'assistant')
    .map(m => m.content);

  const { data: questions } = await supabase
    .from('diagnostic_questions')
    .select('*')
    .order('priority', { ascending: false });

  for (const q of questions || []) {
    const triggerSymptoms = q.trigger_symptoms || [];

    const hasMatchingSymptom = triggerSymptoms.some((ts: string) =>
      detectedSymptoms.includes(ts)
    );

    const questionText = language === 'hi' ? q.question_hi : q.question_en;
    const alreadyAsked = askedQuestions.some(asked =>
      asked.includes(questionText)
    );

    if (hasMatchingSymptom && !alreadyAsked) {
      return {
        question: questionText,
        code: q.question_code,
        answerType: q.answer_type,
        options: q.options,
      };
    }
  }

  return null;
}

async function fetchCharacterisationContext(supabase: any, fieldProfileId: string) {
  const { data: fieldProfile } = await supabase
    .from('field_profiles')
    .select('*')
    .eq('id', fieldProfileId)
    .maybeSingle();

  if (!fieldProfile) return null;

  const { data: soilProfile } = await supabase
    .from('soil_profiles')
    .select('*')
    .eq('field_id', fieldProfileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: irrigationProfile } = await supabase
    .from('irrigation_profiles')
    .select('*')
    .eq('field_id', fieldProfileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recentCropHistory } = await supabase
    .from('crop_history')
    .select('*')
    .eq('field_id', fieldProfileId)
    .order('planting_date', { ascending: false })
    .limit(3);

  const { data: recentInputHistory } = await supabase
    .from('input_history')
    .select('*')
    .eq('field_id', fieldProfileId)
    .order('application_date', { ascending: false })
    .limit(5);

  return {
    field: fieldProfile,
    soil: soilProfile,
    irrigation: irrigationProfile,
    cropHistory: recentCropHistory || [],
    inputHistory: recentInputHistory || [],
  };
}
