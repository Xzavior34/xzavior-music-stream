-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create artists table
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artists"
  ON public.artists FOR SELECT
  USING (true);

-- Create albums table
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  image_url TEXT,
  release_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view albums"
  ON public.albums FOR SELECT
  USING (true);

-- Create tracks table
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracks"
  ON public.tracks FOR SELECT
  USING (true);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public playlists"
  ON public.playlists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Create playlist_tracks junction table
CREATE TABLE public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlist tracks if playlist is public"
  ON public.playlist_tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add tracks to own playlists"
  ON public.playlist_tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tracks from own playlists"
  ON public.playlist_tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Create liked_tracks table
CREATE TABLE public.liked_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own liked tracks"
  ON public.liked_tracks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can like tracks"
  ON public.liked_tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike tracks"
  ON public.liked_tracks FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert sample data
INSERT INTO public.artists (name, bio, image_url) VALUES
  ('Electric Pulse', 'Electronic music producer', NULL),
  ('Street Poets', 'Hip-hop collective', NULL),
  ('Sunset Riders', 'Indie rock band', NULL),
  ('The Blue Notes', 'Jazz ensemble', NULL);

INSERT INTO public.albums (title, artist_id, artist_name, release_year) VALUES
  ('Neon Dreams', (SELECT id FROM public.artists WHERE name = 'Electric Pulse'), 'Electric Pulse', 2024),
  ('Urban Tales', (SELECT id FROM public.artists WHERE name = 'Street Poets'), 'Street Poets', 2023),
  ('Golden Hour', (SELECT id FROM public.artists WHERE name = 'Sunset Riders'), 'Sunset Riders', 2024),
  ('Midnight Jazz', (SELECT id FROM public.artists WHERE name = 'The Blue Notes'), 'The Blue Notes', 2023);

-- Insert sample tracks (using placeholder audio URLs)
INSERT INTO public.tracks (title, artist_id, artist_name, album_id, duration, audio_url) VALUES
  ('Neon Lights', (SELECT id FROM public.artists WHERE name = 'Electric Pulse'), 'Electric Pulse', (SELECT id FROM public.albums WHERE title = 'Neon Dreams'), 245, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
  ('Digital Dreams', (SELECT id FROM public.artists WHERE name = 'Electric Pulse'), 'Electric Pulse', (SELECT id FROM public.albums WHERE title = 'Neon Dreams'), 198, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
  ('City Streets', (SELECT id FROM public.artists WHERE name = 'Street Poets'), 'Street Poets', (SELECT id FROM public.albums WHERE title = 'Urban Tales'), 223, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
  ('Sunset Drive', (SELECT id FROM public.artists WHERE name = 'Sunset Riders'), 'Sunset Riders', (SELECT id FROM public.albums WHERE title = 'Golden Hour'), 267, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
  ('Blue Evening', (SELECT id FROM public.artists WHERE name = 'The Blue Notes'), 'The Blue Notes', (SELECT id FROM public.albums WHERE title = 'Midnight Jazz'), 312, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3');