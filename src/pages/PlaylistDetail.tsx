import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Play, Heart, ArrowLeft } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { deezerApi, DeezerPlaylist } from '@/services/deezerApi';
import { PlaylistTracksList } from '@/components/PlaylistTracksList';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, addToQueue } = useAudio();
  const [playlist, setPlaylist] = useState<DeezerPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    fetchPlaylistData();
  }, [id]);

  const fetchPlaylistData = async () => {
    try {
      const playlistData = await deezerApi.getPlaylist(Number(id));
      setPlaylist(playlistData);
      setTracks(playlistData.tracks?.data || []);
    } catch (error: any) {
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newTracks: any[]) => {
    setTracks(newTracks);
    toast.success('Playlist reordered');
  };

  const playPlaylist = () => {
    if (playlist?.tracks?.data && playlist.tracks.data.length > 0) {
      const firstTrack = playlist.tracks.data[0];
      playTrack({
        id: firstTrack.id.toString(),
        title: firstTrack.title,
        artist_name: firstTrack.artist.name,
        audio_url: firstTrack.preview,
        duration: firstTrack.duration,
      });
      
      playlist.tracks.data.slice(1).forEach(track => {
        addToQueue({
          id: track.id.toString(),
          title: track.title,
          artist_name: track.artist.name,
          audio_url: track.preview,
          duration: track.duration,
        });
      });
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
        <MobileNav />
        <div className="flex-1 flex items-center justify-center pt-[65px] lg:pt-0">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
        <MobileNav />
        <div className="flex-1 flex items-center justify-center pt-[65px] lg:pt-0">
          <div className="text-center p-4">
            <p className="text-lg sm:text-xl mb-4">Playlist not found</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
      <MobileNav />
      
      <main className="flex-1 overflow-y-auto pb-32 lg:pb-24 pt-[65px] lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 lg:mb-6"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
            <div className="w-full sm:w-48 lg:w-64 aspect-square rounded-lg bg-muted flex-shrink-0 shadow-2xl overflow-hidden">
              <img 
                src={playlist.picture_xl || playlist.picture_medium} 
                alt={playlist.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <p className="text-xs sm:text-sm uppercase tracking-wide text-muted-foreground mb-2">Playlist</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 lg:mb-4">{playlist.title}</h1>
              {playlist.description && (
                <p className="text-sm sm:text-base text-muted-foreground mb-3 lg:mb-4 line-clamp-2">
                  {playlist.description}
                </p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 lg:mb-6">
                {playlist.tracks?.data?.length || 0} songs
              </p>
              
              <div className="flex items-center gap-3 lg:gap-4">
                <Button onClick={playPlaylist} size="lg" className="rounded-full">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 ml-0.5" fill="currentColor" />
                  <span className="hidden sm:inline">Play</span>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full p-3">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>

          <PlaylistTracksList
            tracks={tracks}
            onReorder={handleReorder}
            onPlayTrack={handlePlayTrack}
            formatDuration={formatDuration}
            canReorder={true}
          />

          {tracks.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              This playlist is empty
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlaylistDetail;
