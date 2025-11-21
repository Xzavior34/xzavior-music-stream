import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { Button } from '@/components/ui/button';
import { Play, Heart, ArrowLeft } from 'lucide-react';
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

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  user_id: string;
}

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, addToQueue } = useAudio();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylistData();
  }, [id]);

  const fetchPlaylistData = async () => {
    try {
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single();

      if (playlistError) throw playlistError;

      const { data: playlistTracks, error: tracksError } = await supabase
        .from('playlist_tracks')
        .select('track_id, tracks(*)')
        .eq('playlist_id', id)
        .order('position');

      if (tracksError) throw tracksError;

      setPlaylist(playlistData);
      setTracks(playlistTracks?.map((pt: any) => pt.tracks) || []);
    } catch (error: any) {
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const playPlaylist = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0]);
      tracks.slice(1).forEach(track => addToQueue(track));
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar className="w-64 flex-shrink-0" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex h-screen">
        <Sidebar className="w-64 flex-shrink-0" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Playlist not found</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 flex-shrink-0" />
      
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-8 mb-8">
            <div className="w-64 h-64 rounded-lg bg-muted flex-shrink-0 shadow-2xl">
              {playlist.image_url ? (
                <img src={playlist.image_url} alt={playlist.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 rounded-lg" />
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Playlist</p>
              <h1 className="text-5xl font-bold mb-4">{playlist.title}</h1>
              {playlist.description && (
                <p className="text-muted-foreground mb-4">{playlist.description}</p>
              )}
              <p className="text-sm text-muted-foreground mb-6">{tracks.length} songs</p>
              
              <div className="flex items-center gap-4">
                <Button onClick={playPlaylist} size="lg" className="rounded-full">
                  <Play className="w-5 h-5 mr-2 ml-0.5" fill="currentColor" />
                  Play
                </Button>
                <Button variant="outline" size="lg" className="rounded-full">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-card transition-colors group cursor-pointer"
                onClick={() => playTrack(track)}
              >
                <div className="w-8 text-center text-muted-foreground group-hover:hidden">
                  {index + 1}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hidden group-hover:flex items-center justify-center"
                >
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{track.artist_name}</div>
                </div>
                <div className="text-sm text-muted-foreground">{formatDuration(track.duration)}</div>
              </div>
            ))}
          </div>

          {tracks.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              This playlist is empty
            </div>
          )}
        </div>
      </main>

      <Player />
    </div>
  );
};

export default PlaylistDetail;
