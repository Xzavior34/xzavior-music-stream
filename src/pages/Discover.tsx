import { useState, useEffect } from "react";
// Sidebar import kept for consistency, but hidden in layout
import { Sidebar } from "@/components/Sidebar"; 
import { MobileNav } from "@/components/MobileNav";
import { PlaylistCard } from "@/components/PlaylistCard"; 
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Loader2, Play } from "lucide-react"; 
import { useAudio } from "@/contexts/AudioContext";

// 1. Updated Interface to match your 'tracks' table in the database
interface Track {
  id: string;
  title: string;
  artist_name: string | null; 
  image_url: string | null;
  audio_url: string | null;
  uploaded_by: string | null;
  duration: number;
  // Optional: If you link tracks to profiles
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export default function Discover() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudio();
  
  // 2. Listen to 'tracks' table updates
  useRealtimeSubscription('tracks', ['public_tracks']);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      // 3. Query the 'tracks' table (as seen in your screenshot)
      const { data, error } = await supabase
        .from('tracks') 
        .select(`
          id,
          title,
          artist_name,
          image_url,
          audio_url,
          duration,
          uploaded_by
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 4. Fetch uploader profiles (only if uploaded_by exists)
      if (data && data.length > 0) {
        // Filter out tracks that don't have an uploaded_by (system tracks)
        const userIds = [...new Set(data.map(t => t.uploaded_by).filter(Boolean))];
        
        let profilesMap = new Map();

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds as string[]);
            
          profilesMap = new Map(
            profilesData?.map(p => [p.id, p]) || []
          );
        }

        const tracksWithProfiles = data.map(track => ({
          ...track,
          profiles: track.uploaded_by ? profilesMap.get(track.uploaded_by) : null
        }));

        setTracks(tracksWithProfiles as Track[]);
      } else {
        setTracks([]);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      // This toast will tell you if the query failed
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (track: Track) => {
    if (!track.audio_url) {
      toast.error("Audio not available for this track");
      return;
    }
    playTrack({
      id: track.id,
      title: track.title,
      artist_name: track.artist_name || 'Unknown',
      audio_url: track.audio_url,
      duration: track.duration || 0,
      image_url: track.image_url,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar hidden to match your full-mobile design */}
      {/* <Sidebar className="hidden lg:flex w-64 flex-shrink-0" /> */}
      
      <main className="flex-1 w-full overflow-y-auto pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-[65px] lg:pt-8 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Discover</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Explore the latest tracks from the community
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No songs uploaded yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="cursor-pointer group relative"
                  onClick={() => handlePlay(track)}
                >
                  <PlaylistCard
                    title={track.title}
                    // Show Artist Name or Uploader Username
                    description={`by ${track.artist_name || track.profiles?.username || 'Unknown'}`}
                    imageUrl={track.image_url || "/placeholder.svg"}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-md">
                    <div className="bg-primary p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                       <Play className="fill-black text-black ml-1 w-6 h-6" />
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
