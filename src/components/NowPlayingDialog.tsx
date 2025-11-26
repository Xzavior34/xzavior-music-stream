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
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-gradient-to-br from-background to-muted">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex flex-col items-center p-8 pt-16">
            {/* Album Art */}
            <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-2xl mb-8 animate-scale-in">
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
            <div className="text-center mb-6 w-full animate-fade-in">
              <h2 className="text-2xl font-bold mb-2 truncate">{currentTrack.title}</h2>
              <p className="text-muted-foreground truncate">{currentTrack.artist_name}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLyrics(true)}
                className="gap-2"
              >
                <Mic2 className="w-4 h-4" />
                Lyrics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQueue(true)}
                className="gap-2"
              >
                <ListMusic className="w-4 h-4" />
                Queue ({queue.length})
              </Button>
            </div>

          {/* Progress Bar */}
          <div className="w-full mb-6">
            <Slider
              value={localProgress}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalTime)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-6">
            <button 
              onClick={toggleShuffle}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                shuffle && "text-primary"
              )}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button 
              onClick={skipPrevious} 
              className="text-foreground hover:scale-110 transition-transform"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            
            <button 
              onClick={skipNext} 
              className="text-foreground hover:scale-110 transition-transform"
            >
              <SkipForward className="w-6 h-6" />
            </button>
            
            <button 
              onClick={toggleRepeat}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors relative",
                repeat !== 'off' && "text-primary"
              )}
            >
              <Repeat className="w-5 h-5" />
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