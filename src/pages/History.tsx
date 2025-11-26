import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MobileNav } from "@/components/MobileNav";
import { useAudio } from "@/contexts/AudioContext";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { Music, Clock, Play, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface HistoryTrack {
  id: string;
  track_id: string;
  played_at: string;
  tracks: {
    id: string;
    title: string;
    artist_name: string;
    audio_url: string;
    duration: number;
    image_url: string | null;
  } | null;
}

interface TrackWithCount {
  track_id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  image_url: string | null;
  last_played: string;
  play_count: number;
}

export default function History() {
  const [historyTracks, setHistoryTracks] = useState<TrackWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  // Real-time subscription for listening history
  useRealtimeSubscription('listening_history', ['listening_history'], user?.id);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('listening_history')
        .select(`
          id,
          track_id,
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
        .limit(100);

      if (error) throw error;

      // Group by track_id and count plays
      const trackMap = new Map<string, TrackWithCount>();
      
      (data || []).forEach((item: HistoryTrack) => {
        if (!item.tracks) return;
        
        const existing = trackMap.get(item.track_id);
        if (existing) {
          existing.play_count += 1;
          // Keep the most recent played_at
          if (new Date(item.played_at) > new Date(existing.last_played)) {
            existing.last_played = item.played_at;
          }
        } else {
          trackMap.set(item.track_id, {
            track_id: item.track_id,
            title: item.tracks.title,
            artist_name: item.tracks.artist_name,
            audio_url: item.tracks.audio_url,
            duration: item.tracks.duration,
            image_url: item.tracks.image_url,
            last_played: item.played_at,
            play_count: 1,
          });
        }
      });

      // Convert to array and sort by last played
      const tracksArray = Array.from(trackMap.values()).sort(
        (a, b) => new Date(b.last_played).getTime() - new Date(a.last_played).getTime()
      );

      setHistoryTracks(tracksArray);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load listening history');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: TrackWithCount) => {
    playTrack({
      id: track.track_id,
      title: track.title,
      artist_name: track.artist_name,
      audio_url: track.audio_url,
      duration: track.duration,
      image_url: track.image_url || undefined,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <main className="flex-1 w-full overflow-y-auto pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-[65px] lg:pt-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/40 to-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-primary" />
              </div>
              <div className="lg:hidden flex-1">
                <h1 className="text-2xl font-bold mb-1">Listening History</h1>
                <p className="text-sm text-muted-foreground">{historyTracks.length} tracks</p>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <h1 className="text-5xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Listening History
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Your recent listening activity • {historyTracks.length} unique tracks
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : historyTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <Music className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No listening history yet</h2>
              <p className="text-muted-foreground mb-6">Start playing songs to see them here</p>
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in">
              {historyTracks.map((track, index) => (
                <div
                  key={`${track.track_id}-${index}`}
                  onClick={() => handlePlayTrack(track)}
                  className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted/50 cursor-pointer group active:scale-[0.98] transition-all"
                >
                  {/* Play Count Badge */}
                  <div className="w-10 sm:w-12 flex-shrink-0 text-center">
                    <div className="text-sm font-bold text-foreground">{index + 1}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <Play className="w-2.5 h-2.5" />
                      {track.play_count}
                    </div>
                  </div>
                  
                  {/* Album Art */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted relative group">
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
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{track.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {track.artist_name}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Last Played Timestamp */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(track.last_played)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(track.duration)}
                      </div>
                    </div>
                    
                    {/* Mobile: Just show timestamp */}
                    <div className="sm:hidden text-xs text-muted-foreground">
                      {formatTimestamp(track.last_played)}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TrackLikeButton
                        trackId={track.track_id}
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
        </div>
      </main>
    </div>
  );
}

