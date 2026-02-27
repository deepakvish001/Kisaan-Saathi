/*
  # Add Image Analysis Tracking

  ## Overview
  Enhances the crop_images table to support AI-powered image analysis tracking.
  
  ## Changes
  
  ### 1. Add analysis tracking fields to `crop_images`
  - `analysis_status` (text) - pending, processing, completed, failed
  - `analyzed_at` (timestamptz) - When analysis completed
  - `detected_symptoms_codes` (text[]) - Array of symptom codes detected in image
  
  ## Purpose
  - Track the status of AI analysis for each uploaded image
  - Store structured symptom codes that can link to the diagnostic system
  - Enable integration between visual analysis and conversation flow
  
  ## Important Notes
  - Images start with 'pending' status
  - Analysis is triggered after successful upload
  - Detected symptoms integrate with existing symptom detection system
*/

-- Add analysis tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crop_images' AND column_name = 'analysis_status'
  ) THEN
    ALTER TABLE crop_images ADD COLUMN analysis_status text DEFAULT 'pending' 
      CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crop_images' AND column_name = 'analyzed_at'
  ) THEN
    ALTER TABLE crop_images ADD COLUMN analyzed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crop_images' AND column_name = 'detected_symptom_codes'
  ) THEN
    ALTER TABLE crop_images ADD COLUMN detected_symptom_codes text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Add index for querying by analysis status
CREATE INDEX IF NOT EXISTS idx_crop_images_analysis_status ON crop_images(analysis_status);
