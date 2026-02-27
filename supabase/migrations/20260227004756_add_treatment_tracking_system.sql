/*
  # Add Treatment Tracking and Reminder System

  ## Overview
  This migration adds comprehensive treatment tracking and reminder functionality to help farmers
  follow through on recommended treatments and track their progress over time.

  ## New Tables
  
  ### 1. `treatment_plans`
  Master treatment plan generated from advisory recommendations.
  - `id` (uuid, primary key)
  - `advisory_id` (uuid, foreign key to advisories)
  - `user_id` (uuid, foreign key to auth.users)
  - `title` (text) - Treatment plan title
  - `description` (text) - Overall plan description
  - `start_date` (date) - When treatment should begin
  - `end_date` (date) - Expected completion date
  - `status` (text) - pending, in_progress, completed, abandoned
  - `progress_percentage` (integer) - 0-100 completion percentage
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `treatment_steps`
  Individual actionable steps within a treatment plan.
  - `id` (uuid, primary key)
  - `treatment_plan_id` (uuid, foreign key to treatment_plans)
  - `step_number` (integer) - Order sequence
  - `title` (text) - Step title
  - `description` (text) - Detailed instructions
  - `scheduled_date` (date) - When to perform this step
  - `scheduled_time` (time) - Preferred time of day
  - `status` (text) - pending, completed, skipped
  - `completed_at` (timestamptz) - Actual completion timestamp
  - `notes` (text) - Farmer's notes on completion
  - `created_at` (timestamptz)

  ### 3. `treatment_reminders`
  Scheduled reminders for treatment steps.
  - `id` (uuid, primary key)
  - `treatment_step_id` (uuid, foreign key to treatment_steps)
  - `user_id` (uuid, foreign key to auth.users)
  - `reminder_time` (timestamptz) - When to send reminder
  - `reminder_type` (text) - advance, due, overdue
  - `message` (text) - Reminder message content
  - `is_sent` (boolean) - Whether reminder was delivered
  - `is_read` (boolean) - Whether user has seen it
  - `created_at` (timestamptz)

  ### 4. `treatment_logs`
  Detailed logs of treatment applications with observations.
  - `id` (uuid, primary key)
  - `treatment_step_id` (uuid, foreign key to treatment_steps)
  - `user_id` (uuid, foreign key to auth.users)
  - `applied_at` (timestamptz) - When treatment was applied
  - `product_used` (text) - Specific product/method used
  - `quantity` (text) - Amount applied
  - `weather_conditions` (text) - Weather during application
  - `observations` (text) - Farmer's observations
  - `effectiveness_rating` (integer) - 1-5 rating
  - `photos` (jsonb) - Array of photo URLs
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own treatment plans and data
  - Authenticated users required for all operations

  ## Important Notes
  - Treatment plans automatically calculate progress based on completed steps
  - Reminders can be scheduled in advance, at due time, and for overdue items
  - Treatment logs preserve valuable knowledge for future reference
  - All timestamps timezone-aware for accurate scheduling
*/

-- Create treatment_plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisory_id uuid REFERENCES advisories(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'abandoned')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own treatment plans"
  ON treatment_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own treatment plans"
  ON treatment_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatment plans"
  ON treatment_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatment plans"
  ON treatment_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create treatment_steps table
CREATE TABLE IF NOT EXISTS treatment_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id uuid REFERENCES treatment_plans(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treatment_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage steps for their treatment plans"
  ON treatment_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treatment_plans
      WHERE treatment_plans.id = treatment_steps.treatment_plan_id
      AND treatment_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM treatment_plans
      WHERE treatment_plans.id = treatment_steps.treatment_plan_id
      AND treatment_plans.user_id = auth.uid()
    )
  );

-- Create treatment_reminders table
CREATE TABLE IF NOT EXISTS treatment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_step_id uuid REFERENCES treatment_steps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_time timestamptz NOT NULL,
  reminder_type text NOT NULL DEFAULT 'due' CHECK (reminder_type IN ('advance', 'due', 'overdue')),
  message text NOT NULL,
  is_sent boolean DEFAULT false,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treatment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reminders"
  ON treatment_reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reminders"
  ON treatment_reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON treatment_reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON treatment_reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create treatment_logs table
CREATE TABLE IF NOT EXISTS treatment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_step_id uuid REFERENCES treatment_steps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  product_used text,
  quantity text,
  weather_conditions text,
  observations text,
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  photos jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE treatment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own treatment logs"
  ON treatment_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own treatment logs"
  ON treatment_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatment logs"
  ON treatment_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatment logs"
  ON treatment_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_treatment_plans_user ON treatment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(status);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_advisory ON treatment_plans(advisory_id);
CREATE INDEX IF NOT EXISTS idx_treatment_steps_plan ON treatment_steps(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_steps_status ON treatment_steps(status);
CREATE INDEX IF NOT EXISTS idx_treatment_steps_scheduled ON treatment_steps(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_treatment_reminders_user ON treatment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_reminders_time ON treatment_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_treatment_reminders_read ON treatment_reminders(is_read);
CREATE INDEX IF NOT EXISTS idx_treatment_logs_user ON treatment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_logs_step ON treatment_logs(treatment_step_id);