import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
// Removed Sidebar import
import { MobileNav } from "@/components/MobileNav";
import { useAudio } from "@/contexts/AudioContext";
import { AddToPlaylistPopover } from "@/components/AddToPlaylistPopover";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { Music, Heart, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface LikedTrack {
  id: string;
  track_id: string;
  created_at: string;
  tracks: {
    id: string;
    title: string;
    artist_name: string;
    audio_url: string;
    duration: number;
    album_id: string | null;
  };
}

export default function Library() {
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchLikedTracks();
  }, [user, navigate]);

  // Real-time subscription for liked tracks
  useRealtimeSubscription('liked_tracks', ['liked_tracks'], user?.id);

  const fetchLikedTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('liked_tracks')
        .select(`
          id,
          track_id,
          created_at,
          tracks (
            id,
            title,
            artist_name,
            audio_url,
            duration,
            album_id
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLikedTracks(data || []);
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
      toast.error('Failed to load liked songs');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: any) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist_name: track.artist_name,
      audio_url: track.audio_url,
      duration: track.duration,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <main className="flex-1 w-full overflow-y-auto pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-[65px] lg:pt-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 lg:w-56 lg:h-56 bg-gradient-to-br from-primary/40 to-primary/10 rounded flex items-center justify-center">
                <Heart className="w-8 h-8 lg:w-24 lg:h-24 text-primary" fill="currentColor" />
              </div>
              <div className="lg:hidden flex-1">
                <p className="text-xs text-muted-foreground mb-1">Playlist</p>
                <h1 className="text-2xl font-bold mb-2">Liked Songs</h1>
                <p className="text-sm text-muted-foreground">{likedTracks.length} songs</p>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <p className="text-sm font-semibold mb-2">Playlist</p>
              <h1 className="text-7xl font-black mb-6">Liked Songs</h1>
              <p className="text-sm text-muted-foreground">{likedTracks.length} songs</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : likedTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Music className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No liked songs yet</h2>
              <p className="text-muted-foreground mb-6">Songs you like will appear here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {likedTracks.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handlePlayTrack(item.tracks)}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 cursor-pointer group"
                >
                  <span className="text-sm text-muted-foreground w-8 text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.tracks.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.tracks.artist_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDuration(item.tracks.duration)}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AddToPlaylistPopover
                        trackId={item.tracks.id}
                        trackTitle={item.tracks.title}
                        artistName={item.tracks.artist_name}
                        audioUrl={item.tracks.audio_url}
                        duration={item.tracks.duration}
                        albumId={item.tracks.album_id || undefined}
                      />
                      <TrackLikeButton
                        trackId={item.tracks.id}
                        trackTitle={item.tracks.title}
                        artistName={item.tracks.artist_name}
                        audioUrl={item.tracks.audio_url}
                        duration={item.tracks.duration}
                        albumId={item.tracks.album_id || undefined}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
