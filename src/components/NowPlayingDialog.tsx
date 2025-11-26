import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAudio, useAudioElement } from "@/contexts/AudioContext";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, X, ListMusic, Mic2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QueueDialog } from "@/components/QueueDialog";
import { LyricsDialog } from "@/components/LyricsDialog";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { AudioVisualizer } from "@/components/AudioVisualizer";

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
  
  const audioElement = useAudioElement();
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
        <DialogContent className="max-w-lg sm:max-w-2xl p-0 gap-0 overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 h-[100dvh] sm:h-auto">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-10 h-10 w-10 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex flex-col h-full p-6 sm:p-8 pt-16 sm:pt-20">
            {/* Context Header */}
            <div className="text-center mb-6 animate-fade-in">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PLAYING FROM YOUR LIBRARY</p>
              <h3 className="text-sm font-semibold">Now Playing</h3>
            </div>

            {/* Album Art with Visualizer Overlay */}
            <div className="w-full max-w-[340px] aspect-square rounded-lg overflow-hidden shadow-2xl mb-8 animate-scale-in mx-auto relative">
              {currentTrack.image_url ? (
                <img 
                  src={currentTrack.image_url} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10" />
              )}
              
              {/* Audio Visualizer Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
                <AudioVisualizer 
                  audioElement={audioElement} 
                  isPlaying={isPlaying}
                  className="h-full opacity-90"
                  barCount={30}
                />
              </div>
            </div>

            {/* Track Info */}
            <div className="w-full mb-8 animate-fade-in px-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold mb-2 truncate">{currentTrack.title}</h2>
                  <p className="text-base text-muted-foreground truncate">{currentTrack.artist_name}</p>
                </div>
                <TrackLikeButton
                  trackId={currentTrack.id}
                  trackTitle={currentTrack.title}
                  artistName={currentTrack.artist_name}
                  audioUrl={currentTrack.audio_url}
                  duration={currentTrack.duration}
                  albumId={currentTrack.album_id}
                />
              </div>
            </div>

          {/* Progress Bar */}
          <div className="w-full mb-6 px-2">
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
          <div className="flex items-center justify-center gap-6 mb-8">
            <button 
              onClick={toggleShuffle}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors touch-manipulation",
                shuffle && "text-primary"
              )}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button 
              onClick={skipPrevious} 
              className="text-foreground hover:scale-110 transition-transform touch-manipulation active:scale-95"
              aria-label="Previous track"
            >
              <SkipBack className="w-7 h-7" fill="currentColor" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg touch-manipulation"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7" fill="currentColor" />
              ) : (
                <Play className="w-7 h-7 ml-1" fill="currentColor" />
              )}
            </button>
            
            <button 
              onClick={skipNext} 
              className="text-foreground hover:scale-110 transition-transform touch-manipulation active:scale-95"
              aria-label="Next track"
            >
              <SkipForward className="w-7 h-7" fill="currentColor" />
            </button>
            
            <button 
              onClick={toggleRepeat}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors relative touch-manipulation",
                repeat !== 'off' && "text-primary"
              )}
              aria-label={`Repeat: ${repeat}`}
            >
              <Repeat className="w-5 h-5" />
              {repeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-auto pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQueue(true)}
              className="gap-2"
            >
              <ListMusic className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLyrics(true)}
              className="gap-2"
            >
              <Mic2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};