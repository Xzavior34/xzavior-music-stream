import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [progress, setProgress] = useState([30]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-player border-t border-border h-24 px-4 flex items-center justify-between">
      {/* Now Playing */}
      <div className="flex items-center gap-4 w-[300px]">
        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/40 to-primary/10" />
        </div>
        <div>
          <div className="font-semibold text-sm">Track Name</div>
          <div className="text-xs text-muted-foreground">Artist Name</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[700px]">
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground w-10 text-right">1:23</span>
          <Slider
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10">3:45</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-[300px] justify-end">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="w-24"
        />
      </div>
    </div>
  );
};
