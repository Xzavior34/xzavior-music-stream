-- Add image_url column to tracks table
ALTER TABLE tracks ADD COLUMN image_url text;

-- Create images storage bucket for cover art
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload images" 
ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

-- Allow public read access to images
CREATE POLICY "Public can view images" 
ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'images');