import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { AlbumCard } from "@/components/AlbumCard";
import { PlaylistCard } from "@/components/PlaylistCard";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { AddToPlaylistPopover } from "@/components/AddToPlaylistPopover";
import { Recommendations } from "@/components/Recommendations";
import { musicService } from "@/services/musicService";
import { deezerApi } from "@/services/deezerApi";
import { useAudio } from "@/contexts/AudioContext";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface Album {
  id: string | number;
  title: string;
  artist: { name: string };
  cover_xl?: string;
  cover_medium?: string;
}

interface Playlist {
  id: string | number;
  title: string;
  description: string;
  picture_xl?: string;
  picture_medium?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudio();

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time subscriptions for instant updates
  useRealtimeSubscription('tracks', ['tracks'], user?.id);
  useRealtimeSubscription('liked_tracks', ['liked_tracks'], user?.id);
  useRealtimeSubscription('playlists', ['playlists'], user?.id);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [albumsData, playlistsData, chartData] = await Promise.all([
        musicService.getAlbums(),
        musicService.getPlaylists(),
        deezerApi.getChart(),
      ]);

      setAlbums(albumsData.slice(0, 12));
      setPlaylists(playlistsData.slice(0, 8));
      setTrendingTracks(chartData.slice(0, 5));
      
      if (albumsData.length > 0 || playlistsData.length > 0) {
        toast.success('Music loaded successfully');
      }
    } catch (error) {
      toast.error('Failed to load music data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: any) => {
    playTrack({
      id: track.id.toString(),
      title: track.title,
      artist_name: track.artist.name,
      audio_url: track.preview,
      duration: track.duration,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
      <MobileNav />
      
      <main className="flex-1 overflow-y-auto pb-[140px] lg:pb-24 pt-[65px] lg:pt-0">
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
              {/* AI Recommendations */}
              {user && <Recommendations />}

              {/* Trending Songs */}
              <section className="mb-8 lg:mb-12">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">Trending Now</h2>
                </div>
                <div className="space-y-1">
                  {trendingTracks.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => handlePlayTrack(track)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/30 cursor-pointer group transition-all"
                    >
                      <span className="text-sm font-bold text-primary w-6 text-center">
                        {index + 1}
                      </span>
                      <img
                        src={track.album.cover_medium}
                        alt={track.title}
                        className="w-14 h-14 rounded-md flex-shrink-0 shadow-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddToPlaylistPopover
                          trackId={track.id.toString()}
                          trackTitle={track.title}
                          artistName={track.artist.name}
                          audioUrl={track.preview}
                          duration={track.duration}
                        />
                        <TrackLikeButton
                          trackId={track.id.toString()}
                          trackTitle={track.title}
                          artistName={track.artist.name}
                          audioUrl={track.preview}
                          duration={track.duration}
                        />
                      </div>
                      <Play className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-primary" />
                    </div>
                  ))}
                </div>
              </section>

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
    </div>
  );
};

export default Index;
