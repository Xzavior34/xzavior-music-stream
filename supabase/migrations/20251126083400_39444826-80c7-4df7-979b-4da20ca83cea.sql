-- Add support for external tracks in playlists
ALTER TABLE playlist_tracks ADD COLUMN external_track_id TEXT;

-- Update the check to ensure either track_id or external_track_id is set
ALTER TABLE playlist_tracks ADD CONSTRAINT track_id_or_external_id_check 
  CHECK (
    (track_id IS NOT NULL AND external_track_id IS NULL) OR
    (track_id IS NULL AND external_track_id IS NOT NULL)
  );

-- Add foreign key for external tracks
ALTER TABLE playlist_tracks 
  ADD CONSTRAINT playlist_tracks_external_track_id_fkey 
  FOREIGN KEY (external_track_id) 
  REFERENCES external_tracks(id) 
  ON DELETE CASCADE;

-- Update RLS policies to work with both track types
DROP POLICY IF EXISTS "Anyone can view playlist tracks if playlist is public" ON playlist_tracks;

CREATE POLICY "Anyone can view playlist tracks if playlist is public" 
ON playlist_tracks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM playlists 
    WHERE playlists.id = playlist_tracks.playlist_id 
    AND (playlists.is_public = true OR playlists.user_id = auth.uid())
  )
);