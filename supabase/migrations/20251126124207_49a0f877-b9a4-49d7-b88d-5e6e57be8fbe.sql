-- Create playlist collaborators table for collaborative playlists
CREATE TABLE public.playlist_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(playlist_id, user_id)
);

-- Enable RLS
ALTER TABLE public.playlist_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for playlist_collaborators
CREATE POLICY "Users can view collaborators of their playlists or playlists they collaborate on"
  ON public.playlist_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_collaborators.playlist_id 
      AND (p.user_id = auth.uid() OR playlist_collaborators.user_id = auth.uid())
    )
  );

CREATE POLICY "Playlist owners can add collaborators"
  ON public.playlist_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_collaborators.playlist_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Playlist owners can remove collaborators"
  ON public.playlist_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_collaborators.playlist_id 
      AND p.user_id = auth.uid()
    )
  );

-- Update playlist_tracks policy to allow collaborators to add tracks
DROP POLICY IF EXISTS "Users can add tracks to own playlists" ON public.playlist_tracks;

CREATE POLICY "Users can add tracks to owned or collaborated playlists"
  ON public.playlist_tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_tracks.playlist_id 
      AND (
        p.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.playlist_collaborators pc 
          WHERE pc.playlist_id = p.id 
          AND pc.user_id = auth.uid() 
          AND pc.can_edit = true
        )
      )
    )
  );

-- Update playlist_tracks delete policy to allow collaborators
DROP POLICY IF EXISTS "Users can remove tracks from own playlists" ON public.playlist_tracks;

CREATE POLICY "Users can remove tracks from owned or collaborated playlists"
  ON public.playlist_tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_tracks.playlist_id 
      AND (
        p.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.playlist_collaborators pc 
          WHERE pc.playlist_id = p.id 
          AND pc.user_id = auth.uid() 
          AND pc.can_edit = true
        )
      )
    )
  );

-- Enable realtime for playlist_collaborators
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlist_collaborators;