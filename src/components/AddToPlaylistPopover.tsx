import { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Playlist {
  id: string;
  title: string;
  image_url: string | null;
}

interface AddToPlaylistPopoverProps {
  trackId: string;
  trackTitle?: string;
  artistName?: string;
  audioUrl?: string;
  duration?: number;
  albumId?: string;
  isExternalTrack?: boolean; // true for Deezer tracks, false/undefined for uploaded tracks
  imageUrl?: string;
  previewUrl?: string;
}

export const AddToPlaylistPopover = ({
  trackId,
  trackTitle,
  artistName,
  audioUrl,
  duration,
  albumId,
  isExternalTrack = false,
  imageUrl,
  previewUrl,
}: AddToPlaylistPopoverProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && open) {
      fetchPlaylists();
      checkAddedPlaylists();
    }
  }, [user, open]);

  const fetchPlaylists = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('id, title, image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const checkAddedPlaylists = async () => {
    if (!user) return;

    try {
      const column = isExternalTrack ? 'external_track_id' : 'track_id';
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select('playlist_id')
        .eq(column, trackId);

      if (error) throw error;
      setAddedPlaylists(new Set(data?.map(pt => pt.playlist_id) || []));
    } catch (error) {
      console.error('Error checking playlists:', error);
    }
  };

  const addToPlaylist = async (playlistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to add songs to playlists');
      return;
    }

    setLoading(true);
    try {
      // For external tracks, ensure they exist in external_tracks table
      if (isExternalTrack && trackTitle && artistName && previewUrl && duration) {
        await supabase
          .from('external_tracks')
          .upsert({
            id: trackId,
            title: trackTitle,
            artist_name: artistName,
            preview_url: previewUrl,
            duration: duration,
            image_url: imageUrl || null,
            album_name: albumId || null,
          }, { onConflict: 'id' });
      } 
      // For internal tracks, ensure they exist in tracks table
      else if (!isExternalTrack && trackTitle && artistName && audioUrl && duration) {
        await supabase
          .from('tracks')
          .upsert({
            id: trackId,
            title: trackTitle,
            artist_name: artistName,
            audio_url: audioUrl,
            duration: duration,
            album_id: albumId || null,
          }, { onConflict: 'id' });
      }

      // Get the current max position
      const { data: existingTracks } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existingTracks && existingTracks.length > 0 
        ? existingTracks[0].position + 1 
        : 0;

      // Add to playlist with correct track reference
      const insertData = isExternalTrack
        ? { playlist_id: playlistId, external_track_id: trackId, position: nextPosition }
        : { playlist_id: playlistId, track_id: trackId, position: nextPosition };

      const { error } = await supabase
        .from('playlist_tracks')
        .insert(insertData);

      if (error) throw error;

      setAddedPlaylists(prev => new Set([...prev, playlistId]));
      toast.success('Added to playlist');
    } catch (error) {
      console.error('Error adding to playlist:', error);
      toast.error('Failed to add to playlist');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="mb-2 px-2 py-1.5">
          <h4 className="font-semibold text-sm">Add to playlist</h4>
        </div>
        <ScrollArea className="h-[200px]">
          {playlists.length === 0 ? (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              No playlists yet. Create one first!
            </div>
          ) : (
            <div className="space-y-1">
              {playlists.map((playlist) => {
                const isAdded = addedPlaylists.has(playlist.id);
                return (
                  <button
                    key={playlist.id}
                    onClick={(e) => !isAdded && addToPlaylist(playlist.id, e)}
                    disabled={loading || isAdded}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    {playlist.image_url ? (
                      <img 
                        src={playlist.image_url} 
                        alt={playlist.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="flex-1 truncate text-sm">{playlist.title}</span>
                    {isAdded && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
