import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Play } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  album_id: string | null;
}

interface Album {
  id: string;
  title: string;
  artist_name: string;
  image_url: string | null;
}

const Search = () => {
  const navigate = useNavigate();
  const { playTrack } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setTracks([]);
        setAlbums([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data: trackData } = await supabase
        .from('tracks')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`)
        .limit(20);

      const { data: albumData } = await supabase
        .from('albums')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`)
        .limit(10);

      setTracks(trackData || []);
      setAlbums(albumData || []);
    } catch (error: any) {
      toast.error('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 flex-shrink-0" />
      
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">Search</h1>
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for songs, albums, or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {loading && <div className="text-center text-muted-foreground">Searching...</div>}

          {!loading && searchQuery && (
            <>
              {albums.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Albums</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {albums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => navigate(`/album/${album.id}`)}
                        className="p-4 rounded-lg bg-card hover:bg-card/80 cursor-pointer transition-all"
                      >
                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                          {album.image_url ? (
                            <img src={album.image_url} alt={album.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 rounded-lg" />
                          )}
                        </div>
                        <h3 className="font-semibold text-sm truncate">{album.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{album.artist_name}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tracks.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Tracks</h2>
                  <div className="space-y-2">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-card transition-colors group"
                      >
                        <button
                          onClick={() => playTrack(track)}
                          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{track.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{track.artist_name}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{formatDuration(track.duration)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!loading && tracks.length === 0 && albums.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  No results found for "{searchQuery}"
                </div>
              )}
            </>
          )}

          {!searchQuery && (
            <div className="text-center text-muted-foreground py-12">
              Search for your favorite music
            </div>
          )}
        </div>
      </main>

      <Player />
    </div>
  );
};

export default Search;
