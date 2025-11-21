import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { AlbumCard } from "@/components/AlbumCard";
import { PlaylistCard } from "@/components/PlaylistCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import album1 from "@/assets/album1.jpg";
import album2 from "@/assets/album2.jpg";
import album3 from "@/assets/album3.jpg";
import album4 from "@/assets/album4.jpg";
import playlist1 from "@/assets/playlist1.jpg";
import playlist2 from "@/assets/playlist2.jpg";

const imageMap: Record<string, string> = {
  album1,
  album2,
  album3,
  album4,
  playlist1,
  playlist2,
};

interface Album {
  id: string;
  title: string;
  artist_name: string;
  image_url: string | null;
}

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: albumsData } = await supabase
        .from('albums')
        .select('*')
        .limit(6);

      const { data: playlistsData } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_public', true)
        .limit(4);

      if (albumsData) {
        const albumsWithImages = albumsData.map((album, index) => ({
          ...album,
          image_url: album.image_url || [album1, album2, album3, album4][index % 4],
        }));
        setAlbums(albumsWithImages);
      }

      if (playlistsData) {
        const playlistsWithImages = playlistsData.map((playlist, index) => ({
          ...playlist,
          image_url: playlist.image_url || [playlist1, playlist2][index % 2],
        }));
        setPlaylists(playlistsWithImages);
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 flex-shrink-0" />
      
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Good evening</h1>
            <p className="text-muted-foreground">Your favorite tracks are waiting</p>
          </div>

          {/* Featured Albums */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular Albums</h2>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Show all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {albums.map((album) => (
                <div key={album.id} onClick={() => navigate(`/album/${album.id}`)}>
                  <AlbumCard
                    title={album.title}
                    artist={album.artist_name}
                    imageUrl={album.image_url || album1}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Featured Playlists */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Made For You</h2>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Show all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <div key={playlist.id} onClick={() => navigate(`/playlist/${playlist.id}`)}>
                  <PlaylistCard
                    title={playlist.title}
                    description={playlist.description || ''}
                    imageUrl={playlist.image_url || playlist1}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Recently Played */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently Played</h2>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Show all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {albums.slice(0, 4).map((album) => (
                <div key={`recent-${album.id}`} onClick={() => navigate(`/album/${album.id}`)}>
                  <AlbumCard
                    title={album.title}
                    artist={album.artist_name}
                    imageUrl={album.image_url || album1}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Player />
    </div>
  );
};

export default Index;
