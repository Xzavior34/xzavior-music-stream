import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/AudioContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddToPlaylistPopover } from "@/components/AddToPlaylistPopover";
import { NowPlayingDialog } from "@/components/NowPlayingDialog";

export const Player = () => {
  const { currentTrack, isPlaying, progress, volume, queue, shuffle, repeat, togglePlay, skipNext, skipPrevious, setVolume: setAudioVolume, setProgress: setAudioProgress, toggleShuffle, toggleRepeat } = useAudio();
  const [localVolume, setLocalVolume] = useState([volume]);
  const [localProgress, setLocalProgress] = useState([progress]);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  useEffect(() => {
    setLocalProgress([progress]);
  }, [progress]);

  const handleVolumeChange = (value: number[]) => {
    setLocalVolume(value);
    setAudioVolume(value[0]);
  };

  const handleProgressChange = (value: number[]) => {
    setLocalProgress(value);
    setAudioProgress(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = currentTrack ? (localProgress[0] / 100) * currentTrack.duration : 0;
  const totalTime = currentTrack?.duration || 0;

  return (
    <>
      <NowPlayingDialog open={showNowPlaying} onOpenChange={setShowNowPlaying} />
      
      <div className="fixed bottom-0 left-0 right-0 bg-player/95 backdrop-blur-xl border-t border-border h-20 sm:h-24 px-2 sm:px-4 flex items-center justify-between z-50 shadow-2xl">
        {/* Now Playing */}
        <div 
          className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 lg:w-[300px] lg:flex-initial cursor-pointer hover:bg-muted/20 rounded-lg p-2 transition-colors"
          onClick={() => currentTrack && setShowNowPlaying(true)}
        >
          {currentTrack ? (
            <>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                {currentTrack.image_url ? (
                  <img 
                    src={currentTrack.image_url} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded bg-gradient-to-br from-primary/40 to-primary/10" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs sm:text-sm truncate">{currentTrack.title}</div>
                <div className="text-xs text-muted-foreground truncate">{currentTrack.artist_name}</div>
              </div>
            </>
          ) : (
            <div className="text-xs sm:text-sm text-muted-foreground">No track playing</div>
          )}
        </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 max-w-[700px]">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleShuffle}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors hidden sm:block",
              shuffle && "text-primary"
            )}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={skipPrevious} className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
          </button>
          <button onClick={skipNext} className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={toggleRepeat}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center relative",
              repeat !== 'off' && "text-primary"
            )}
          >
            <Repeat className="w-4 h-4" />
            {repeat === 'one' && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full">
          <span className="text-xs text-muted-foreground w-8 sm:w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={localProgress}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="flex-1"
            disabled={!currentTrack}
          />
          <span className="text-xs text-muted-foreground w-8 sm:w-10">{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Volume & Queue */}
      <div className="hidden lg:flex items-center gap-2 w-[300px] justify-end">
        {currentTrack && (
          <AddToPlaylistPopover
            trackId={currentTrack.id}
            trackTitle={currentTrack.title}
            artistName={currentTrack.artist_name}
            audioUrl={currentTrack.audio_url}
            duration={currentTrack.duration}
            albumId={currentTrack.album_id}
            isExternalTrack={!currentTrack.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)}
            imageUrl={currentTrack.image_url}
            previewUrl={currentTrack.audio_url}
          />
        )}
        <div className="text-xs text-muted-foreground">
          Queue: {queue.length}
        </div>
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={localVolume}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="w-24"
        />
      </div>
    </div>
    </>
  );
};
