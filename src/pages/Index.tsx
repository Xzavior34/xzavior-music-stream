import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Player } from "@/components/Player";
import { AlbumCard } from "@/components/AlbumCard";
import { PlaylistCard } from "@/components/PlaylistCard";
import { deezerApi, DeezerAlbum, DeezerPlaylist } from "@/services/deezerApi";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<DeezerAlbum[]>([]);
  const [playlists, setPlaylists] = useState<DeezerPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [albumsData, playlistsData] = await Promise.all([
        deezerApi.getChartAlbums(),
        deezerApi.getEditorialPlaylists(),
      ]);

      setAlbums(albumsData.slice(0, 12));
      setPlaylists(playlistsData.slice(0, 8));
    } catch (error) {
      toast.error('Failed to load music data');
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
          {/* Welcome Section */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Good evening</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover trending music from around the world
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Featured Albums */}
              <section className="mb-8 lg:mb-12">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">Top Albums</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                  {albums.slice(0, 6).map((album) => (
                    <div
                      key={album.id}
                      onClick={() => navigate(`/album/${album.id}`)}
                    >
                      <AlbumCard
                        title={album.title}
                        artist={album.artist.name}
                        imageUrl={album.cover_xl || album.cover_medium}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Featured Playlists */}
              <section className="mb-8 lg:mb-12">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">Featured Playlists</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {playlists.slice(0, 4).map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                    >
                      <PlaylistCard
                        title={playlist.title}
                        description={playlist.description || 'Curated playlist'}
                        imageUrl={playlist.picture_xl || playlist.picture_medium}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* More Albums */}
              <section>
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">More to Explore</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                  {albums.slice(6, 12).map((album) => (
                    <div
                      key={album.id}
                      onClick={() => navigate(`/album/${album.id}`)}
                    >
                      <AlbumCard
                        title={album.title}
                        artist={album.artist.name}
                        imageUrl={album.cover_xl || album.cover_medium}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Player />
    </div>
  );
};

export default Index;
