/*
  # Add User Profiles and Authentication Links

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text, optional)
      - `location` (text, optional)
      - `preferred_language` (text, default 'en')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Table Modifications
    - Add `user_id` column to `conversations` table
    - Add `user_id` column to `advisories` table
    - Add `user_id` column to `user_queries` table

  3. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
    - Add policy for users to insert their own profile
    - Update RLS policies on conversations, advisories, and user_queries to check user ownership

  4. Important Notes
    - User profiles are linked to Supabase auth.users table
    - Users can only access their own data
    - All queries and conversations are now user-specific
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  location text,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add user_id to conversations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
  END IF;
END $$;

-- Add user_id to advisories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisories' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE advisories ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_advisories_user_id ON advisories(user_id);
  END IF;
END $$;

-- Add user_id to user_queries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_queries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_queries ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON user_queries(user_id);
  END IF;
END $$;

-- Update RLS policies for conversations
DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can read conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON conversations;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for advisories
DROP POLICY IF EXISTS "Anyone can create advisories" ON advisories;
DROP POLICY IF EXISTS "Anyone can read advisories" ON advisories;
DROP POLICY IF EXISTS "Anyone can update advisories" ON advisories;

CREATE POLICY "Users can view own advisories"
  ON advisories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own advisories"
  ON advisories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own advisories"
  ON advisories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for user_queries
DROP POLICY IF EXISTS "Anyone can create user_queries" ON user_queries;
DROP POLICY IF EXISTS "Anyone can read user_queries" ON user_queries;

CREATE POLICY "Users can view own queries"
  ON user_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own queries"
  ON user_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();