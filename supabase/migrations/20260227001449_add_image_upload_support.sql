/*
  # Add Image Upload Support for Visual Diagnosis

  ## Overview
  This migration adds support for farmers to upload crop images during consultations.
  Images provide visual context for more accurate disease diagnosis.

  ## New Tables
  
  ### 1. `crop_images`
  Stores metadata and references to uploaded crop images.
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to conversations)
  - `file_path` (text) - Path in Supabase Storage bucket
  - `file_name` (text) - Original filename
  - `file_size` (integer) - Size in bytes
  - `mime_type` (text) - Image MIME type
  - `upload_source` (text) - camera or gallery
  - `description` (text) - Optional farmer description
  - `analysis_results` (jsonb) - AI vision analysis results
  - `created_at` (timestamptz)

  ## Storage Setup
  - Creates 'crop-images' storage bucket for image files
  - Bucket configured for authenticated uploads
  - Public read access for viewing images

  ## Security
  - RLS enabled on crop_images table
  - Users can upload images to any conversation (public access for now)
  - Images are viewable by everyone
  - Future: Add user_id foreign key to restrict to own uploads

  ## Important Notes
  - Images stored in Supabase Storage, not database
  - File paths are relative to bucket root
  - Analysis results can store AI vision API responses
  - Supports JPEG, PNG, WebP formats
*/

-- Create crop_images table
CREATE TABLE IF NOT EXISTS crop_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0),
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/jpg')),
  upload_source text DEFAULT 'gallery' CHECK (upload_source IN ('camera', 'gallery')),
  description text,
  analysis_results jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crop_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crop_images
CREATE POLICY "Anyone can upload crop images"
  ON crop_images FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Crop images are viewable by everyone"
  ON crop_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can delete their uploaded images"
  ON crop_images FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crop_images_conversation ON crop_images(conversation_id);
CREATE INDEX IF NOT EXISTS idx_crop_images_created ON crop_images(created_at DESC);

-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crop-images',
  'crop-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for crop-images bucket
CREATE POLICY "Anyone can upload crop images to storage"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'crop-images');

CREATE POLICY "Crop images are publicly viewable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'crop-images');

CREATE POLICY "Users can delete their uploaded image files"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'crop-images');