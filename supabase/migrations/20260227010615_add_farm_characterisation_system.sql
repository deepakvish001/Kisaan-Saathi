-- Farm & Crop Characterisation System
-- 
-- This migration creates a comprehensive farm characterisation system that enables
-- personalized agricultural diagnostics and recommendations.
--
-- New Tables:
--   1. farm_profiles - Overall farm information for each user
--   2. field_profiles - Individual field/plot characteristics within a farm
--   3. soil_profiles - Soil analysis and characteristics
--   4. irrigation_profiles - Irrigation system and water management details
--   5. crop_history - Historical crop cultivation and outcomes
--   6. input_history - Fertilizers, pesticides, and amendments applied
--
-- Modifications:
--   - Add farm_profile_id and field_profile_id to conversations table
--
-- Security:
--   - Enable RLS on all new tables
--   - Users can only access their own characterisation data
--   - Policies for SELECT, INSERT, UPDATE, DELETE operations

-- 1. Create farm_profiles table
CREATE TABLE IF NOT EXISTS farm_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name text NOT NULL,
  total_area numeric,
  location text,
  latitude numeric,
  longitude numeric,
  farm_type text NOT NULL DEFAULT 'smallholder' CHECK (farm_type IN ('smallholder', 'commercial', 'organic', 'mixed')),
  primary_crops jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farm profiles"
  ON farm_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own farm profiles"
  ON farm_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farm profiles"
  ON farm_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own farm profiles"
  ON farm_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Create field_profiles table
CREATE TABLE IF NOT EXISTS field_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farm_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  area numeric,
  elevation numeric,
  slope text DEFAULT 'flat' CHECK (slope IN ('flat', 'gentle', 'moderate', 'steep')),
  drainage text DEFAULT 'adequate' CHECK (drainage IN ('poor', 'adequate', 'good', 'excellent')),
  sun_exposure text DEFAULT 'full_sun' CHECK (sun_exposure IN ('full_sun', 'partial_shade', 'full_shade')),
  wind_exposure text DEFAULT 'moderate' CHECK (wind_exposure IN ('sheltered', 'moderate', 'exposed')),
  proximity_to_water text DEFAULT 'near' CHECK (proximity_to_water IN ('adjacent', 'near', 'far')),
  field_notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE field_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own field profiles"
  ON field_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own field profiles"
  ON field_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own field profiles"
  ON field_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own field profiles"
  ON field_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Create soil_profiles table
CREATE TABLE IF NOT EXISTS soil_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES field_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  soil_type text NOT NULL CHECK (soil_type IN ('sandy', 'loamy', 'clay', 'silt', 'peat', 'chalk')),
  soil_texture text,
  ph_level numeric CHECK (ph_level >= 0 AND ph_level <= 14),
  organic_matter text DEFAULT 'medium' CHECK (organic_matter IN ('low', 'medium', 'high')),
  nitrogen_level text CHECK (nitrogen_level IN ('low', 'medium', 'high')),
  phosphorus_level text CHECK (phosphorus_level IN ('low', 'medium', 'high')),
  potassium_level text CHECK (potassium_level IN ('low', 'medium', 'high')),
  test_date date,
  test_lab text,
  soil_color text,
  soil_depth numeric,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE soil_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own soil profiles"
  ON soil_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own soil profiles"
  ON soil_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own soil profiles"
  ON soil_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own soil profiles"
  ON soil_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Create irrigation_profiles table
CREATE TABLE IF NOT EXISTS irrigation_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES field_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  water_source text NOT NULL CHECK (water_source IN ('well', 'canal', 'river', 'rainwater', 'borewell', 'municipal')),
  irrigation_method text NOT NULL CHECK (irrigation_method IN ('drip', 'sprinkler', 'flood', 'furrow', 'manual', 'rainfed')),
  water_quality text DEFAULT 'good' CHECK (water_quality IN ('excellent', 'good', 'fair', 'poor')),
  irrigation_frequency text DEFAULT 'as_needed' CHECK (irrigation_frequency IN ('daily', 'alternate_days', 'weekly', 'as_needed')),
  water_availability text DEFAULT 'adequate' CHECK (water_availability IN ('abundant', 'adequate', 'limited', 'scarce')),
  drainage_system boolean DEFAULT false,
  water_storage boolean DEFAULT false,
  pumping_capacity text,
  irrigation_schedule jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE irrigation_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own irrigation profiles"
  ON irrigation_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own irrigation profiles"
  ON irrigation_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own irrigation profiles"
  ON irrigation_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own irrigation profiles"
  ON irrigation_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Create crop_history table
CREATE TABLE IF NOT EXISTS crop_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES field_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES crops(id),
  crop_name text NOT NULL,
  variety text,
  planting_date date NOT NULL,
  harvest_date date,
  season text NOT NULL CHECK (season IN ('kharif', 'rabi', 'zaid', 'perennial')),
  yield_quantity numeric,
  yield_unit text,
  yield_quality text CHECK (yield_quality IN ('excellent', 'good', 'fair', 'poor')),
  diseases_encountered jsonb DEFAULT '[]'::jsonb,
  pests_encountered jsonb DEFAULT '[]'::jsonb,
  success_rating integer CHECK (success_rating >= 1 AND success_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crop_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crop history"
  ON crop_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own crop history"
  ON crop_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crop history"
  ON crop_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own crop history"
  ON crop_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Create input_history table
CREATE TABLE IF NOT EXISTS input_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES field_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_type text NOT NULL CHECK (input_type IN ('fertilizer', 'pesticide', 'herbicide', 'fungicide', 'organic_amendment')),
  input_name text NOT NULL,
  active_ingredient text,
  application_date date NOT NULL,
  quantity numeric NOT NULL,
  quantity_unit text NOT NULL,
  application_method text CHECK (application_method IN ('spray', 'broadcast', 'drip', 'soil_incorporation')),
  target_pest_disease text,
  effectiveness integer CHECK (effectiveness >= 1 AND effectiveness <= 5),
  cost numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE input_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own input history"
  ON input_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own input history"
  ON input_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own input history"
  ON input_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own input history"
  ON input_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Add characterisation columns to conversations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'farm_profile_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN farm_profile_id uuid REFERENCES farm_profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'field_profile_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN field_profile_id uuid REFERENCES field_profiles(id);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_farm_profiles_user_id ON farm_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_field_profiles_farm_id ON field_profiles(farm_id);
CREATE INDEX IF NOT EXISTS idx_field_profiles_user_id ON field_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_profiles_field_id ON soil_profiles(field_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_profiles_field_id ON irrigation_profiles(field_id);
CREATE INDEX IF NOT EXISTS idx_crop_history_field_id ON crop_history(field_id);
CREATE INDEX IF NOT EXISTS idx_input_history_field_id ON input_history(field_id);
CREATE INDEX IF NOT EXISTS idx_conversations_farm_profile_id ON conversations(farm_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_field_profile_id ON conversations(field_profile_id);