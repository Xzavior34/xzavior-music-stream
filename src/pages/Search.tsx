import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Play } from "lucide-react";
import { AlbumCard } from "@/components/AlbumCard";
import { AddToPlaylistPopover } from "@/components/AddToPlaylistPopover";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { useNavigate } from "react-router-dom";
import { deezerApi, DeezerTrack } from "@/services/deezerApi";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { playTrack } = useAudio();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await deezerApi.searchTracks(query);
      setSearchResults(results.slice(0, 20));
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: DeezerTrack) => {
    // Convert Deezer track to our format
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden lg:flex w-64 flex-shrink-0" />
      <MobileNav />
      
      <main className="flex-1 overflow-y-auto pb-32 lg:pb-24 pt-[65px] lg:pt-0">
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

          {searchResults.length > 0 && (
            <>
              {/* Album results */}
              <section className="mb-8 lg:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 lg:mb-6">
                  Albums for "{searchQuery}"
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                  {Array.from(new Map(searchResults.map(track => [track.album.id, track])).values())
                    .slice(0, 6)
                    .map((track) => (
                      <div
                        key={track.album.id}
                        onClick={() => navigate(`/album/${track.album.id}`)}
                      >
                        <AlbumCard
                          title={track.album.title}
                          artist={track.artist.name}
                          imageUrl={track.album.cover_xl || track.album.cover_medium}
                        />
                      </div>
                    ))}
                </div>
              </section>

              {/* Track results */}
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
                          src={track.album.cover_medium}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base truncate">{track.title}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                          {formatDuration(track.duration)}
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
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {searchQuery && !loading && searchResults.length === 0 && (
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
