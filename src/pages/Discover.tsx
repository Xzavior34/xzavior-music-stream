import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
// You likely need a SongCard component, but we can reuse PlaylistCard for now or use a generic div
import { PlaylistCard } from "@/components/PlaylistCard"; 
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
// import { useNavigate } from "react-router-dom"; // You might play the song instead of navigating
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Loader2, Play } from "lucide-react"; // Added Play icon

// 1. Update Interface to match your 'songs' table
interface Song {
  id: string;
  title: string;
  artist: string | null; // specific artist field if you have it
  image_url: string | null;
  song_url: string | null;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}

export default function Discover() {
  // 2. Rename state to 'songs'
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 3. Update Realtime subscription to listen to 'songs' table
  useRealtimeSubscription('songs', ['public_songs']);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      // 4. Change query from 'playlists' to 'songs'
      const { data, error } = await supabase
        .from('songs') 
        .select(`
          id,
          title,
          artist,
          image_url,
          song_url,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 5. Keep your existing logic to fetch uploader profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(s => s.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds.filter(Boolean) as string[]);

        const profilesMap = new Map(
          profilesData?.map(p => [p.id, p]) || []
        );

        const songsWithProfiles = data.map(song => ({
          ...song,
          profiles: profilesMap.get(song.user_id!) || {
            username: null,
            avatar_url: null,
          },
        }));

        setSongs(songsWithProfiles as Song[]);
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
      <MobileNav />
      
      <main className="flex-1 overflow-y-auto pb-32 lg:pb-24 pt-[65px] lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Discover Songs</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Explore the latest tracks from the community
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No songs uploaded yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="cursor-pointer group relative"
                  // Add your play logic here
                  onClick={() => console.log("Play song:", song.title)} 
                >
                  {/* Reuse PlaylistCard or create a SongCard. 
                      Passing song data into the props. */}
                  <PlaylistCard
                    title={song.title}
                    description={`by ${song.artist || song.profiles?.username || 'Unknown'}`}
                    imageUrl={song.image_url || undefined}
                  />
                  
                  {/* Optional: Add a visual play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-md">
                    <div className="bg-green-500 p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                       <Play className="fill-black text-black ml-1" />
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
