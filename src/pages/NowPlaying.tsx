import { useNavigate } from "react-router-dom";
import { ChevronDown, Heart, MoreHorizontal, Repeat, Shuffle, SkipBack, SkipForward, Play, Pause, Music } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { TrackLikeButton } from "@/components/TrackLikeButton";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="min-h-screen bg-gradient-to-b from-primary/20 via-background to-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted/50 rounded-full transition-all hover:scale-110">
            <ChevronDown className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground font-semibold tracking-wider">PLAYING FROM</p>
            <p className="text-sm font-bold">Album</p>
          </div>
          <button className="p-2 hover:bg-muted/50 rounded-full transition-all hover:scale-110">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Album Art / Lyrics Tabs */}
      <div className="px-6 pt-8 pb-8">
        <Tabs defaultValue="cover" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="cover">Cover</TabsTrigger>
            <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cover" className="mt-0">
            <div className="aspect-square w-full max-w-md mx-auto rounded-2xl bg-gradient-to-br from-primary/50 via-primary/30 to-primary/10 shadow-premium animate-pulse" style={{ animationDuration: '3s' }} />
          </TabsContent>
          
          <TabsContent value="lyrics" className="mt-0">
            <div className="w-full max-w-md mx-auto h-[400px] rounded-2xl bg-card/50 backdrop-blur border border-border/50 overflow-hidden">
              <LyricsDisplay 
                trackId={currentTrack.id} 
                currentTime={currentTime}
                isPlaying={isPlaying}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Track Info */}
      <div className="px-6 pb-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black truncate mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{currentTrack.title}</h1>
            <p className="text-base text-muted-foreground truncate font-medium">{currentTrack.artist_name}</p>
          </div>
          <TrackLikeButton 
            trackId={currentTrack.id}
            trackTitle={currentTrack.title}
            artistName={currentTrack.artist_name}
            audioUrl={currentTrack.audio_url}
            duration={currentTrack.duration}
            className="scale-125"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-2">
        <Slider
          value={localProgress}
          onValueChange={handleProgressChange}
          max={100}
          step={0.1}
          className="w-full [&_.relative]:h-1 [&_[role=slider]]:bg-foreground [&_[role=slider]]:shadow-lg"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-3 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          <button className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
            <Shuffle className="w-6 h-6" />
          </button>
          <button onClick={skipPrevious} className="text-foreground hover:scale-110 transition-all">
            <SkipBack className="w-9 h-9" fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center hover:scale-105 transition-all shadow-premium"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10" fill="currentColor" />
            ) : (
              <Play className="w-10 h-10 ml-1" fill="currentColor" />
            )}
          </button>
          <button onClick={skipNext} className="text-foreground hover:scale-110 transition-all">
            <SkipForward className="w-9 h-9" fill="currentColor" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
            <Repeat className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
