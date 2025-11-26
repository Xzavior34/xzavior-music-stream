import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Play, Heart, ArrowLeft, Music } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { deezerApi, DeezerPlaylist } from '@/services/deezerApi';
import { PlaylistTracksList } from '@/components/PlaylistTracksList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AddToPlaylistPopover } from '@/components/AddToPlaylistPopover';

interface UserPlaylist {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  user_id: string;
}

interface PlaylistTrack {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  image_url?: string | null;
  isExternal: boolean;
  album?: { cover_medium?: string };
  artist?: { name: string };
}

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, addToQueue } = useAudio();
  const [playlist, setPlaylist] = useState<DeezerPlaylist | UserPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isUserPlaylist, setIsUserPlaylist] = useState(false);

  useEffect(() => {
    fetchPlaylistData();
  }, [id]);

  const isUUID = (str: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  const fetchPlaylistData = async () => {
    try {
      if (!id) return;
      
      if (isUUID(id)) {
        // Fetch user playlist
        setIsUserPlaylist(true);
        const { data: playlistData, error: playlistError } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', id)
          .single();

        if (playlistError) throw playlistError;
        setPlaylist(playlistData);

        // Fetch playlist tracks with both internal and external tracks
        const { data: playlistTracks, error: tracksError } = await supabase
          .from('playlist_tracks')
          .select(`
            position,
            track_id,
            external_track_id,
            tracks (
              id,
              title,
              artist_name,
              audio_url,
              duration,
              image_url
            ),
            external_tracks (
              id,
              title,
              artist_name,
              preview_url,
              duration,
              image_url
            )
          `)
          .eq('playlist_id', id)
          .order('position', { ascending: true });

        if (tracksError) throw tracksError;

        // Combine tracks from both sources
        const combinedTracks: PlaylistTrack[] = playlistTracks.map((pt: any) => {
          if (pt.tracks) {
            return {
              id: pt.tracks.id,
              title: pt.tracks.title,
              artist_name: pt.tracks.artist_name,
              audio_url: pt.tracks.audio_url,
              duration: pt.tracks.duration,
              image_url: pt.tracks.image_url,
              isExternal: false,
            };
          } else if (pt.external_tracks) {
            return {
              id: pt.external_tracks.id,
              title: pt.external_tracks.title,
              artist_name: pt.external_tracks.artist_name,
              audio_url: pt.external_tracks.preview_url,
              duration: pt.external_tracks.duration,
              image_url: pt.external_tracks.image_url,
              isExternal: true,
            };
          }
          return null;
        }).filter(Boolean) as PlaylistTrack[];

        setTracks(combinedTracks);
      } else {
        // Fetch Deezer playlist
        setIsUserPlaylist(false);
        const playlistData = await deezerApi.getPlaylist(Number(id));
        setPlaylist(playlistData);
        const deezerTracks: PlaylistTrack[] = playlistData.tracks?.data?.map((track: any) => ({
          id: track.id.toString(),
          title: track.title,
          artist_name: track.artist.name,
          audio_url: track.preview,
          duration: track.duration,
          image_url: track.album?.cover_medium,
          isExternal: true,
          artist: track.artist,
          album: track.album,
        })) || [];
        setTracks(deezerTracks);
      }
    } catch (error: any) {
      toast.error('Failed to load playlist');
      console.error('Playlist fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (newTracks: any[]) => {
    setTracks(newTracks);
    toast.success('Playlist reordered');
  };

  const playPlaylist = () => {
    if (tracks.length > 0) {
      const firstTrack = tracks[0];
      playTrack({
        id: firstTrack.id,
        title: firstTrack.title,
        artist_name: firstTrack.artist_name,
        audio_url: firstTrack.audio_url,
        duration: firstTrack.duration,
      });
      
      tracks.slice(1).forEach(track => {
        addToQueue({
          id: track.id,
          title: track.title,
          artist_name: track.artist_name,
          audio_url: track.audio_url,
          duration: track.duration,
        });
      });
    }
  };

  const handlePlayTrack = (track: any) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist_name: track.artist_name,
      audio_url: track.audio_url,
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

  const getPlaylistImage = () => {
    if ('picture_xl' in playlist) {
      return playlist.picture_xl || playlist.picture_medium;
    }
    return playlist.image_url;
  };

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
              {getPlaylistImage() ? (
                <img 
                  src={getPlaylistImage()!} 
                  alt={playlist.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <Music className="w-24 h-24 text-primary/40" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-xs sm:text-sm uppercase tracking-wide text-muted-foreground mb-2">
                {isUserPlaylist ? 'User Playlist' : 'Playlist'}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 lg:mb-4">{playlist.title}</h1>
              {playlist.description && (
                <p className="text-sm sm:text-base text-muted-foreground mb-3 lg:mb-4 line-clamp-2">
                  {playlist.description}
                </p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 lg:mb-6">
                {tracks.length} songs
              </p>
              
              <div className="flex items-center gap-3 lg:gap-4">
                <Button onClick={playPlaylist} size="lg" className="rounded-full" disabled={tracks.length === 0}>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 ml-0.5" fill="currentColor" />
                  <span className="hidden sm:inline">Play</span>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full p-3">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Track list */}
          {tracks.length > 0 ? (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-card transition-colors group"
                >
                  <button
                    onClick={() => handlePlayTrack(track)}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  </button>
                  {track.image_url && (
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{track.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{track.artist_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(track.duration)}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AddToPlaylistPopover
                        trackId={track.id}
                        trackTitle={track.title}
                        artistName={track.artist_name}
                        audioUrl={track.audio_url}
                        duration={track.duration}
                        isExternalTrack={track.isExternal}
                        imageUrl={track.image_url || undefined}
                        previewUrl={track.audio_url}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
