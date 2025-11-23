import { useNavigate } from "react-router-dom";
import { ChevronDown, Heart, MoreHorizontal, Repeat, Shuffle, SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { TrackLikeButton } from "@/components/TrackLikeButton";

export default function NowPlaying() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, progress, togglePlay, skipNext, skipPrevious, setProgress: setAudioProgress } = useAudio();
  const [localProgress, setLocalProgress] = useState([progress]);

  useEffect(() => {
    setLocalProgress([progress]);
  }, [progress]);

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

  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/30 via-background to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No track playing</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 text-primary hover:underline"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/30 via-background to-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronDown className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground">PLAYING FROM</p>
            <p className="text-sm font-semibold">Album</p>
          </div>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Album Art */}
      <div className="px-6 pt-8 pb-6">
        <div className="aspect-square w-full max-w-md mx-auto rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 shadow-2xl" />
      </div>

      {/* Track Info */}
      <div className="px-6 pb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate mb-1">{currentTrack.title}</h1>
            <p className="text-muted-foreground truncate">{currentTrack.artist_name}</p>
          </div>
          <TrackLikeButton trackId={currentTrack.id} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-2">
        <Slider
          value={localProgress}
          onValueChange={handleProgressChange}
          max={100}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Shuffle className="w-6 h-6" />
          </button>
          <button onClick={skipPrevious} className="text-foreground hover:scale-110 transition-transform">
            <SkipBack className="w-8 h-8" fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" fill="currentColor" />
            ) : (
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            )}
          </button>
          <button onClick={skipNext} className="text-foreground hover:scale-110 transition-transform">
            <SkipForward className="w-8 h-8" fill="currentColor" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Repeat className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
