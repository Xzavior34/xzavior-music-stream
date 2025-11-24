-- Create storage bucket for user uploaded songs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('songs', 'songs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for song uploads
CREATE POLICY "Anyone can view songs"
ON storage.objects FOR SELECT
USING (bucket_id = 'songs');

CREATE POLICY "Authenticated users can upload songs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'songs' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own songs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'songs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own songs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'songs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add uploaded_by column to tracks table to track user uploads
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id);

-- Add listening_history table
CREATE TABLE IF NOT EXISTS listening_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  played_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on listening_history
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for listening_history
CREATE POLICY "Users can view their own history"
ON listening_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
ON listening_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_played_at ON listening_history(played_at DESC);