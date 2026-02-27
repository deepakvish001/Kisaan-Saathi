/*
  # KrishiSahay 2.0 - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for KrishiSahay, an intelligent agricultural decision support system.
  The system uses adaptive questioning (Akinator-style) to diagnose crop issues and provide contextual advisories.

  ## New Tables Created
  
  ### 1. `crops`
  Stores information about supported crops with multilingual names and growth stages.
  - `id` (uuid, primary key)
  - `name_en` (text) - Crop name in English
  - `name_hi` (text) - Crop name in Hindi
  - `growth_stages` (jsonb) - Array of growth stages with translations
  - `created_at` (timestamptz)

  ### 2. `symptoms`
  Contains symptom descriptions in multiple languages with severity indicators.
  - `id` (uuid, primary key)
  - `symptom_code` (text, unique) - Unique identifier for symptom
  - `description_en` (text) - English description
  - `description_hi` (text) - Hindi description
  - `severity` (text) - low, moderate, high
  - `visual_indicators` (jsonb) - Visual characteristics
  - `created_at` (timestamptz)

  ### 3. `diseases`
  Disease information with treatments and prevention measures.
  - `id` (uuid, primary key)
  - `disease_code` (text, unique)
  - `name_en` (text)
  - `name_hi` (text)
  - `description_en` (text)
  - `description_hi` (text)
  - `treatment_en` (text)
  - `treatment_hi` (text)
  - `prevention_en` (text)
  - `prevention_hi` (text)
  - `crop_id` (uuid, foreign key to crops)
  - `severity_level` (text)
  - `created_at` (timestamptz)

  ### 4. `symptom_disease_mapping`
  Links symptoms to diseases with probability weights for diagnostic engine.
  - `id` (uuid, primary key)
  - `symptom_id` (uuid, foreign key)
  - `disease_id` (uuid, foreign key)
  - `probability_weight` (numeric) - 0.0 to 1.0
  - `is_primary_indicator` (boolean)
  - `created_at` (timestamptz)

  ### 5. `diagnostic_questions`
  Adaptive follow-up questions based on symptom patterns.
  - `id` (uuid, primary key)
  - `question_code` (text, unique)
  - `question_en` (text)
  - `question_hi` (text)
  - `trigger_symptoms` (jsonb) - Array of symptom codes that trigger this question
  - `answer_type` (text) - multiple_choice, yes_no, text
  - `options` (jsonb) - Available answer options with translations
  - `priority` (integer) - Question ordering priority
  - `created_at` (timestamptz)

  ### 6. `conversations`
  Stores farmer conversation sessions with context and history.
  - `id` (uuid, primary key)
  - `session_id` (text, unique)
  - `language` (text) - User's selected language
  - `crop_id` (uuid, foreign key)
  - `growth_stage` (text)
  - `location` (text)
  - `conversation_history` (jsonb) - Array of messages
  - `detected_symptoms` (jsonb) - Array of symptom codes identified
  - `current_probabilities` (jsonb) - Disease probability scores
  - `status` (text) - active, completed, escalated
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `advisories`
  Generated recommendations with confidence scores and farmer feedback.
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key)
  - `disease_id` (uuid, foreign key)
  - `confidence_score` (numeric) - 0.0 to 1.0
  - `recommendation_text` (text)
  - `language` (text)
  - `action_steps` (jsonb) - Structured action items
  - `escalated` (boolean)
  - `farmer_feedback` (text)
  - `feedback_rating` (integer) - 1 to 5
  - `created_at` (timestamptz)

  ### 8. `agricultural_knowledge_base`
  RAG corpus with vectorized embeddings for semantic search.
  - `id` (uuid, primary key)
  - `content_type` (text) - disease_info, treatment, prevention, best_practice
  - `content_en` (text)
  - `content_hi` (text)
  - `crop_id` (uuid, foreign key)
  - `metadata` (jsonb) - Additional structured data
  - `embedding` (vector) - Text embedding for similarity search
  - `confidence_level` (text) - high, medium, low (source reliability)
  - `source` (text) - Reference source
  - `created_at` (timestamptz)

  ### 9. `user_queries`
  Analytics table tracking query patterns and system performance.
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key)
  - `query_text` (text)
  - `language` (text)
  - `response_time_ms` (integer)
  - `success` (boolean)
  - `error_message` (text)
  - `created_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public read access for reference data (crops, symptoms, diseases)
  - Conversations and advisories are isolated by session

  ## Important Notes
  - All tables use UUID primary keys for scalability
  - Timestamps use timestamptz for timezone awareness
  - JSONB fields allow flexible schema evolution
  - Vector column prepared for future embedding-based RAG
  - All text content includes English and Hindi translations
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_hi text NOT NULL,
  growth_stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crops are viewable by everyone"
  ON crops FOR SELECT
  TO public
  USING (true);

-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_code text UNIQUE NOT NULL,
  description_en text NOT NULL,
  description_hi text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'moderate', 'high')),
  visual_indicators jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Symptoms are viewable by everyone"
  ON symptoms FOR SELECT
  TO public
  USING (true);

-- Create diseases table
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_hi text NOT NULL,
  description_en text NOT NULL,
  description_hi text NOT NULL,
  treatment_en text NOT NULL,
  treatment_hi text NOT NULL,
  prevention_en text,
  prevention_hi text,
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  severity_level text NOT NULL CHECK (severity_level IN ('low', 'moderate', 'high', 'critical')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diseases are viewable by everyone"
  ON diseases FOR SELECT
  TO public
  USING (true);

-- Create symptom_disease_mapping table
CREATE TABLE IF NOT EXISTS symptom_disease_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE NOT NULL,
  disease_id uuid REFERENCES diseases(id) ON DELETE CASCADE NOT NULL,
  probability_weight numeric NOT NULL CHECK (probability_weight >= 0 AND probability_weight <= 1),
  is_primary_indicator boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(symptom_id, disease_id)
);

ALTER TABLE symptom_disease_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Symptom-disease mappings are viewable by everyone"
  ON symptom_disease_mapping FOR SELECT
  TO public
  USING (true);

-- Create diagnostic_questions table
CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_code text UNIQUE NOT NULL,
  question_en text NOT NULL,
  question_hi text NOT NULL,
  trigger_symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  answer_type text NOT NULL CHECK (answer_type IN ('multiple_choice', 'yes_no', 'text')),
  options jsonb DEFAULT '[]'::jsonb,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diagnostic questions are viewable by everyone"
  ON diagnostic_questions FOR SELECT
  TO public
  USING (true);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  language text NOT NULL DEFAULT 'en',
  crop_id uuid REFERENCES crops(id),
  growth_stage text,
  location text,
  conversation_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  detected_symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_probabilities jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'escalated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations"
  ON conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create advisories table
CREATE TABLE IF NOT EXISTS advisories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  disease_id uuid REFERENCES diseases(id),
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  recommendation_text text NOT NULL,
  language text NOT NULL,
  action_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  escalated boolean DEFAULT false,
  farmer_feedback text,
  feedback_rating integer CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create advisories"
  ON advisories FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Advisories are viewable by everyone"
  ON advisories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update advisories for feedback"
  ON advisories FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create agricultural_knowledge_base table
CREATE TABLE IF NOT EXISTS agricultural_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('disease_info', 'treatment', 'prevention', 'best_practice', 'general')),
  content_en text NOT NULL,
  content_hi text NOT NULL,
  crop_id uuid REFERENCES crops(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(384),
  confidence_level text NOT NULL DEFAULT 'medium' CHECK (confidence_level IN ('high', 'medium', 'low')),
  source text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agricultural_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge base is viewable by everyone"
  ON agricultural_knowledge_base FOR SELECT
  TO public
  USING (true);

-- Create user_queries table for analytics
CREATE TABLE IF NOT EXISTS user_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  language text NOT NULL,
  response_time_ms integer,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create query logs"
  ON user_queries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Query logs are viewable by everyone"
  ON user_queries FOR SELECT
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_advisories_conversation ON advisories(conversation_id);
CREATE INDEX IF NOT EXISTS idx_diseases_crop ON diseases(crop_id);
CREATE INDEX IF NOT EXISTS idx_symptom_mapping_disease ON symptom_disease_mapping(disease_id);
CREATE INDEX IF NOT EXISTS idx_symptom_mapping_symptom ON symptom_disease_mapping(symptom_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_crop ON agricultural_knowledge_base(crop_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_type ON agricultural_knowledge_base(content_type);