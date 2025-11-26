import { useState, useEffect } from "react";
import { MobileNav } from "@/components/MobileNav";
import { Sidebar } from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Play } from "lucide-react";
import { AddToPlaylistPopover } from "@/components/AddToPlaylistPopover";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { useNavigate } from "react-router-dom";
import { musicApi, UnifiedTrack } from "@/services/musicApi";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface UploadedTrack {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  image_url: string | null;
  album_id: string | null;
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnifiedTrack[]>([]);
  const [uploadedResults, setUploadedResults] = useState<UploadedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { playTrack } = useAudio();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setUploadedResults([]);
      return;
    }

    setLoading(true);
    let hasResults = false;
    
    // Search uploaded music from Supabase
    const uploadedPromise = (async () => {
      try {
        const { data } = await supabase
          .from('tracks')
          .select('*')
          .or(`title.ilike.%${query}%,artist_name.ilike.%${query}%`)
          .limit(20);
        
        if (data && data.length > 0) {
          setUploadedResults(data);
          hasResults = true;
        } else {
          setUploadedResults([]);
        }
      } catch (error) {
        console.error('Uploaded tracks search failed:', error);
        setUploadedResults([]);
      }
    })();

    // Search from API (JioSaavn + Deezer fallback)
    const apiPromise = (async () => {
      try {
        const results = await musicApi.searchTracks(query);
        if (results.length > 0) {
          setSearchResults(results);
          hasResults = true;
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('API search failed:', error);
        setSearchResults([]);
      }
    })();

    // Wait for both searches to complete
    await Promise.allSettled([uploadedPromise, apiPromise]);

    if (!hasResults) {
      toast.info('No results found. Try a different search term.');
    }
    
    setLoading(false);
  };

  const handlePlayTrack = (track: UnifiedTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist_name: track.artist,
      audio_url: track.audioUrl,
      duration: track.duration,
      image_url: track.imageUrl,
      album_id: track.albumTitle,
    });
  };

  const handlePlayUploadedTrack = (track: UploadedTrack) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist_name: track.artist_name,
      audio_url: track.audio_url,
      duration: track.duration,
      image_url: track.image_url,
      album_id: track.album_id,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
      <MobileNav />
      
      <main className="flex-1 w-full overflow-y-auto pb-32 lg:pb-24 pt-[65px] lg:pt-8">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 lg:mb-6">Search</h1>
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {(searchResults.length > 0 || uploadedResults.length > 0) && (
            <>
              {/* Uploaded tracks */}
              {uploadedResults.length > 0 && (
                <section className="mb-8 lg:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 lg:mb-6">
                    Uploaded Songs
                  </h2>
                  <div className="space-y-1 sm:space-y-2">
                    {uploadedResults.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-card transition-colors group"
                      >
                        <button
                          onClick={() => handlePlayUploadedTrack(track)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" fill="currentColor" />
                        </button>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded flex-shrink-0 overflow-hidden bg-muted">
                          {track.image_url ? (
                            <img
                              src={track.image_url}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base truncate">{track.title}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist_name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Uploaded</Badge>
                          <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                            {formatDuration(track.duration)}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AddToPlaylistPopover
                              trackId={track.id}
                              trackTitle={track.title}
                              artistName={track.artist_name}
                              audioUrl={track.audio_url}
                              duration={track.duration}
                              isExternalTrack={false}
                              imageUrl={track.image_url}
                              previewUrl={track.audio_url}
                              albumId={track.album_id}
                            />
                            <TrackLikeButton
                              trackId={track.id}
                              trackTitle={track.title}
                              artistName={track.artist_name}
                              audioUrl={track.audio_url}
                              duration={track.duration}
                              albumId={track.album_id}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* API Track results */}
              {searchResults.length > 0 && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 lg:mb-6">
                    Songs
                  </h2>
                  <div className="space-y-1 sm:space-y-2">
                    {searchResults.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-card transition-colors group"
                      >
                        <button
                          onClick={() => handlePlayTrack(track)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" fill="currentColor" />
                        </button>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded flex-shrink-0 overflow-hidden">
                          <img
                            src={track.imageUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base truncate">{track.title}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {track.isPreview && (
                            <Badge variant="outline" className="text-xs">Deezer Preview</Badge>
                          )}
                          {!track.isPreview && track.source === 'jiosaavn' && (
                            <Badge variant="secondary" className="text-xs">Full Track</Badge>
                          )}
                          <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                            {formatDuration(track.duration)}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AddToPlaylistPopover
                              trackId={track.id}
                              trackTitle={track.title}
                              artistName={track.artist}
                              audioUrl={track.audioUrl}
                              duration={track.duration}
                              isExternalTrack={true}
                              imageUrl={track.imageUrl}
                              previewUrl={track.audioUrl}
                              albumId={track.albumTitle}
                            />
                            <TrackLikeButton
                              trackId={track.id}
                              trackTitle={track.title}
                              artistName={track.artist}
                              audioUrl={track.audioUrl}
                              duration={track.duration}
                              albumId={track.albumTitle}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {searchQuery && !loading && searchResults.length === 0 && uploadedResults.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No results found for "{searchQuery}"
            </div>
          )}

          {!searchQuery && (
            <div className="text-center text-muted-foreground py-12">
              Search for your favorite music
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
