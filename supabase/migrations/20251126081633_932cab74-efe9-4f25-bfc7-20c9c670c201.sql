-- Create external_tracks table for Deezer and other API tracks
CREATE TABLE IF NOT EXISTS public.external_tracks (
  id text PRIMARY KEY,
  title text NOT NULL,
  artist_name text NOT NULL,
  album_name text,
  image_url text,
  preview_url text NOT NULL,
  duration integer NOT NULL,
  source text NOT NULL DEFAULT 'deezer',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_tracks ENABLE ROW LEVEL SECURITY;

-- Anyone can view external tracks
CREATE POLICY "Anyone can view external tracks" 
ON public.external_tracks 
FOR SELECT 
USING (true);

-- Authenticated users can insert external tracks
CREATE POLICY "Users can insert external tracks" 
ON public.external_tracks 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create liked_external_tracks table
CREATE TABLE IF NOT EXISTS public.liked_external_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id text NOT NULL REFERENCES public.external_tracks(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Enable RLS
ALTER TABLE public.liked_external_tracks ENABLE ROW LEVEL SECURITY;

-- Users can view their own liked external tracks
CREATE POLICY "Users can view own liked external tracks" 
ON public.liked_external_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own liked external tracks
CREATE POLICY "Users can insert own liked external tracks" 
ON public.liked_external_tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own liked external tracks
CREATE POLICY "Users can delete own liked external tracks" 
ON public.liked_external_tracks 
FOR DELETE 
USING (auth.uid() = user_id);