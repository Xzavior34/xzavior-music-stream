import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { PlaylistCard } from "@/components/PlaylistCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Loader2 } from "lucide-react";

interface PublicPlaylist {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}

export default function Discover() {
  const [playlists, setPlaylists] = useState<PublicPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Real-time subscription for public playlists
  useRealtimeSubscription('playlists', ['public_playlists']);

  useEffect(() => {
    fetchPublicPlaylists();
  }, []);

  const fetchPublicPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          id,
          title,
          description,
          image_url,
          user_id
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds.filter(Boolean) as string[]);

        const profilesMap = new Map(
          profilesData?.map(p => [p.id, p]) || []
        );

        const playlistsWithProfiles = data.map(playlist => ({
          ...playlist,
          profiles: profilesMap.get(playlist.user_id!) || {
            username: null,
            avatar_url: null,
          },
        }));

        setPlaylists(playlistsWithProfiles as PublicPlaylist[]);
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Error fetching public playlists:', error);
      toast.error('Failed to load playlists');
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Discover</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Explore public playlists from the community
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No public playlists yet. Be the first to create one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="cursor-pointer"
                >
                  <PlaylistCard
                    title={playlist.title}
                    description={`by ${playlist.profiles?.username || 'Unknown'}`}
                    imageUrl={playlist.image_url || undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
