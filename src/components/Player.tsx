import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ListMusic } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/AudioContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Player = () => {
  const { currentTrack, isPlaying, progress, volume, queue, togglePlay, skipNext, skipPrevious, setVolume: setAudioVolume, setProgress: setAudioProgress } = useAudio();
  const [localVolume, setLocalVolume] = useState([volume]);
  const [localProgress, setLocalProgress] = useState([progress]);
  const navigate = useNavigate();

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
    <div className="fixed bottom-0 left-0 right-0 bg-player border-t border-border h-20 sm:h-24 px-2 sm:px-4 flex items-center justify-between z-50">
      {/* Now Playing */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 lg:w-[300px] lg:flex-initial">
        {currentTrack ? (
          <>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded bg-gradient-to-br from-primary/40 to-primary/10" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="font-semibold text-xs sm:text-sm truncate">{currentTrack.title}</div>
              <div className="text-xs text-muted-foreground truncate">{currentTrack.artist_name}</div>
            </div>
          </>
        ) : (
          <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">No track playing</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 max-w-[700px]">
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
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
          <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            <Repeat className="w-4 h-4" />
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/queue')}
          className="relative"
        >
          <ListMusic className="w-4 h-4" />
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </Button>
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
  );
};
