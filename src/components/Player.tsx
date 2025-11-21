import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/AudioContext";
import { useEffect, useState } from "react";

export const Player = () => {
  const { currentTrack, isPlaying, progress, volume, togglePlay, skipNext, skipPrevious, setVolume: setAudioVolume, setProgress: setAudioProgress } = useAudio();
  const [localVolume, setLocalVolume] = useState([volume]);
  const [localProgress, setLocalProgress] = useState([progress]);

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
    <div className="fixed bottom-0 left-0 right-0 bg-player border-t border-border h-24 px-4 flex items-center justify-between">
      {/* Now Playing */}
      <div className="flex items-center gap-4 w-[300px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
              <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/40 to-primary/10" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{currentTrack.title}</div>
              <div className="text-xs text-muted-foreground truncate">{currentTrack.artist_name}</div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No track playing</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[700px]">
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={skipPrevious} className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={skipNext} className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={localProgress}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="flex-1"
            disabled={!currentTrack}
          />
          <span className="text-xs text-muted-foreground w-10">{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-[300px] justify-end">
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
