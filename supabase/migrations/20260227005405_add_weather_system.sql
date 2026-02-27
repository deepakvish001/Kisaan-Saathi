/*
  # Weather Integration System

  1. New Tables
    - `weather_preferences`
      - Stores user location and weather settings
      - `user_id` (uuid, references auth.users)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `location_name` (text)
      - `temperature_unit` (text, 'celsius' or 'fahrenheit')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `weather_cache`
      - Caches weather data to reduce API calls
      - `location_key` (text, composite of lat/lon)
      - `weather_data` (jsonb, stores full weather response)
      - `forecast_data` (jsonb, stores forecast response)
      - `cached_at` (timestamptz)
      - Valid for 30 minutes

    - `treatment_weather_alerts`
      - Links treatment steps to weather-based timing recommendations
      - `treatment_step_id` (uuid, references treatment_steps)
      - `alert_type` (text: 'favorable', 'warning', 'critical')
      - `message` (text)
      - `weather_condition` (text)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own weather preferences
    - Weather cache is publicly readable (no sensitive data)
    - Treatment alerts tied to user's treatment steps

  3. Indexes
    - Index on weather_cache location_key and cached_at for fast lookups
    - Index on treatment_weather_alerts for active alerts
*/

-- Weather Preferences Table
CREATE TABLE IF NOT EXISTS weather_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  location_name text NOT NULL,
  temperature_unit text DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE weather_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weather preferences"
  ON weather_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather preferences"
  ON weather_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weather preferences"
  ON weather_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weather preferences"
  ON weather_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Weather Cache Table
CREATE TABLE IF NOT EXISTS weather_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_key text UNIQUE NOT NULL,
  weather_data jsonb,
  forecast_data jsonb,
  cached_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 minutes')
);

ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weather cache is publicly readable"
  ON weather_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location_key);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);

-- Treatment Weather Alerts Table
CREATE TABLE IF NOT EXISTS treatment_weather_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_step_id uuid REFERENCES treatment_steps(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('favorable', 'warning', 'critical')),
  message text NOT NULL,
  weather_condition text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE treatment_weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts for their treatment steps"
  ON treatment_weather_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treatment_steps ts
      JOIN treatment_plans tp ON ts.treatment_plan_id = tp.id
      WHERE ts.id = treatment_weather_alerts.treatment_step_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_treatment_weather_alerts_step ON treatment_weather_alerts(treatment_step_id);
CREATE INDEX IF NOT EXISTS idx_treatment_weather_alerts_expires ON treatment_weather_alerts(expires_at);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_weather_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM weather_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired alerts
CREATE OR REPLACE FUNCTION cleanup_expired_weather_alerts()
RETURNS void AS $$
BEGIN
  DELETE FROM treatment_weather_alerts WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;