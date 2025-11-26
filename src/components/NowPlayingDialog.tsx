import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAudio } from "@/contexts/AudioContext";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, X, ListMusic, Mic2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QueueDialog } from "@/components/QueueDialog";
import { LyricsDialog } from "@/components/LyricsDialog";

interface NowPlayingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NowPlayingDialog = ({ open, onOpenChange }: NowPlayingDialogProps) => {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    volume, 
    shuffle, 
    repeat,
    queue,
    togglePlay, 
    skipNext, 
    skipPrevious, 
    setVolume: setAudioVolume, 
    setProgress: setAudioProgress, 
    toggleShuffle, 
    toggleRepeat 
  } = useAudio();
  
  const [localVolume, setLocalVolume] = useState([volume]);
  const [localProgress, setLocalProgress] = useState([progress]);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

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

  if (!currentTrack) return null;

  return (
    <>
      <QueueDialog open={showQueue} onOpenChange={setShowQueue} />
      <LyricsDialog open={showLyrics} onOpenChange={setShowLyrics} />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg sm:max-w-2xl p-0 gap-0 overflow-hidden bg-gradient-to-br from-background to-muted">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          
          <div className="flex flex-col items-center p-4 sm:p-8 pt-12 sm:pt-16">
            {/* Album Art */}
            <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl mb-6 sm:mb-8 animate-scale-in">
              {currentTrack.image_url ? (
                <img 
                  src={currentTrack.image_url} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10" />
              )}
            </div>

            {/* Track Info */}
            <div className="text-center mb-4 sm:mb-6 w-full animate-fade-in px-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 truncate">{currentTrack.title}</h2>
              <p className="text-sm sm:text-base text-muted-foreground truncate">{currentTrack.artist_name}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLyrics(true)}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Mic2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Lyrics</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQueue(true)}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <ListMusic className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Queue</span> ({queue.length})
              </Button>
            </div>

          {/* Progress Bar */}
          <div className="w-full mb-4 sm:mb-6 px-2">
            <Slider
              value={localProgress}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalTime)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <button 
              onClick={toggleShuffle}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors touch-manipulation",
                shuffle && "text-primary"
              )}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={skipPrevious} 
              className="text-foreground hover:scale-110 transition-transform touch-manipulation active:scale-95"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg touch-manipulation"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" />
              )}
            </button>
            
            <button 
              onClick={skipNext} 
              className="text-foreground hover:scale-110 transition-transform touch-manipulation active:scale-95"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
            </button>
            
            <button 
              onClick={toggleRepeat}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors relative touch-manipulation",
                repeat !== 'off' && "text-primary"
              )}
              aria-label={`Repeat: ${repeat}`}
            >
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
              {repeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};