import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MobileNav } from "@/components/MobileNav";
import { useAudio } from "@/contexts/AudioContext";
import { AddToPlaylistPopover } from "@/components/AddToPlaylistPopover";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { Music, Heart, Clock, List } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InternalLikedTrack {
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
    image_url: string | null;
  };
}

interface ExternalLikedTrack {
  id: string;
  track_id: string;
  created_at: string;
  external_tracks: {
    id: string;
    title: string;
    artist_name: string;
    preview_url: string;
    duration: number;
    image_url: string | null;
  };
}

interface CombinedTrack {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  image_url: string | null;
  created_at: string;
  isExternal: boolean;
}

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

interface HistoryTrack {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  image_url: string | null;
  played_at: string;
  play_count: number;
}

export default function Library() {
  const [likedTracks, setLikedTracks] = useState<CombinedTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<HistoryTrack[]>([]);
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
    fetchPlaylists();
    fetchHistory();
  }, [user, navigate]);

  // Real-time subscriptions
  useRealtimeSubscription('liked_tracks', ['liked_tracks'], user?.id);
  useRealtimeSubscription('liked_external_tracks', ['liked_external_tracks'], user?.id);
  useRealtimeSubscription('playlists', ['playlists'], user?.id);
  useRealtimeSubscription('listening_history', ['listening_history'], user?.id);

  const fetchLikedTracks = async () => {
    try {
      // Fetch internal liked tracks
      const { data: internalData, error: internalError } = await supabase
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
            album_id,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (internalError) throw internalError;

      // Fetch external liked tracks (Deezer)
      const { data: externalData, error: externalError } = await supabase
        .from('liked_external_tracks')
        .select(`
          id,
          track_id,
          created_at,
          external_tracks (
            id,
            title,
            artist_name,
            preview_url,
            duration,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (externalError) throw externalError;

      // Combine and sort by created_at
      const combined: CombinedTrack[] = [
        ...(internalData || []).map((item: InternalLikedTrack) => ({
          id: item.tracks.id,
          title: item.tracks.title,
          artist_name: item.tracks.artist_name,
          audio_url: item.tracks.audio_url,
          duration: item.tracks.duration,
          image_url: item.tracks.image_url,
          created_at: item.created_at,
          isExternal: false,
        })),
        ...(externalData || []).map((item: ExternalLikedTrack) => ({
          id: item.external_tracks.id,
          title: item.external_tracks.title,
          artist_name: item.external_tracks.artist_name,
          audio_url: item.external_tracks.preview_url,
          duration: item.external_tracks.duration,
          image_url: item.external_tracks.image_url,
          created_at: item.created_at,
          isExternal: true,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLikedTracks(combined);
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
      toast.error('Failed to load liked songs');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: CombinedTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist_name: track.artist_name,
      audio_url: track.audio_url,
      duration: track.duration,
      image_url: track.image_url || undefined,
    });
  };

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('listening_history')
        .select(`
          id,
          played_at,
          tracks (
            id,
            title,
            artist_name,
            audio_url,
            duration,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('played_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Group by track and count plays
      const trackMap = new Map<string, HistoryTrack>();
      data?.forEach((item: any) => {
        if (item.tracks) {
          const track = item.tracks;
          const existing = trackMap.get(track.id);
          if (existing) {
            existing.play_count++;
            if (new Date(item.played_at) > new Date(existing.played_at)) {
              existing.played_at = item.played_at;
            }
          } else {
            trackMap.set(track.id, {
              id: track.id,
              title: track.title,
              artist_name: track.artist_name,
              audio_url: track.audio_url,
              duration: track.duration,
              image_url: track.image_url,
              played_at: item.played_at,
              play_count: 1,
            });
          }
        }
      });

      setHistory(Array.from(trackMap.values()));
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const played = new Date(timestamp);
    const diffMs = now.getTime() - played.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return played.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <main className="flex-1 w-full overflow-y-auto pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-[65px] lg:pt-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Your Library</h1>
          
          <Tabs defaultValue="songs" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="songs">Liked Songs</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="songs">{loading ? (
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
            <div className="space-y-2">

              {likedTracks.map((track, index) => (
                <div
                  key={`${track.id}-${track.created_at}`}
                  onClick={() => handlePlayTrack(track)}
                  className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted/50 cursor-pointer group active:scale-[0.98] transition-all"
                >
                  <span className="text-sm text-muted-foreground w-6 sm:w-8 text-center hidden sm:block">
                    {index + 1}
                  </span>
                  
                  {/* Album Art */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    {track.image_url ? (
                      <img 
                        src={track.image_url} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
                        <Music className="w-6 h-6 text-primary/60" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{track.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate flex items-center gap-1">
                      {track.artist_name}
                      {track.isExternal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">Deezer</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDuration(track.duration)}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AddToPlaylistPopover
                        trackId={track.id}
                        trackTitle={track.title}
                        artistName={track.artist_name}
                        audioUrl={track.audio_url}
                        duration={track.duration}
                        isExternalTrack={track.isExternal}
                        imageUrl={track.image_url || undefined}
                        previewUrl={track.audio_url}
                        albumId={track.image_url || undefined}
                      />
                      <TrackLikeButton
                        trackId={track.id}
                        trackTitle={track.title}
                        artistName={track.artist_name}
                        audioUrl={track.audio_url}
                        duration={track.duration}
                        albumId={track.image_url || undefined}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </TabsContent>

            <TabsContent value="playlists">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <List className="w-16 h-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No playlists yet</h2>
                  <p className="text-muted-foreground mb-6">Create your first playlist to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 group-hover:shadow-lg transition-shadow">
                        {playlist.image_url ? (
                          <img 
                            src={playlist.image_url} 
                            alt={playlist.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
                            <List className="w-12 h-12 text-primary/60" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{playlist.title}</h3>
                      {playlist.description && (
                        <p className="text-sm text-muted-foreground truncate">{playlist.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No history yet</h2>
                  <p className="text-muted-foreground mb-6">Songs you play will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack({
                        id: track.id,
                        title: track.title,
                        artist_name: track.artist_name,
                        audio_url: track.audio_url,
                        duration: track.duration,
                        image_url: track.image_url || undefined,
                      })}
                      className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted/50 cursor-pointer group active:scale-[0.98] transition-all"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        {track.image_url ? (
                          <img 
                            src={track.image_url} 
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
                            <Music className="w-6 h-6 text-primary/60" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{track.title}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {track.play_count} {track.play_count === 1 ? 'play' : 'plays'} • {formatTimestamp(track.played_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {formatDuration(track.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
