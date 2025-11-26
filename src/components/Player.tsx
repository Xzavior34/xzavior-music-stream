import { Play, Pause } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useState } from "react";
import { NowPlayingDialog } from "@/components/NowPlayingDialog";

export const Player = () => {
  const { currentTrack, isPlaying, progress, togglePlay } = useAudio();
  const [showNowPlaying, setShowNowPlaying] = useState(false);


  if (!currentTrack) return null;

  return (
    <>
      <NowPlayingDialog open={showNowPlaying} onOpenChange={setShowNowPlaying} />
      
      {/* Desktop Player Bar */}
      <div 
        className="hidden lg:block fixed bottom-0 left-0 right-0 z-50 cursor-pointer"
        onClick={() => setShowNowPlaying(true)}
      >
        <div className="bg-primary text-primary-foreground shadow-2xl">
          <div className="flex items-center justify-between px-4 h-20">
            <div className="flex items-center gap-4 overflow-hidden flex-1 max-w-sm">
              <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                {currentTrack.image_url ? (
                  <img 
                    src={currentTrack.image_url} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded bg-gradient-to-br from-white/20 to-white/5" />
                )}
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="font-semibold truncate">{currentTrack.title}</span>
                <span className="text-sm opacity-90 truncate">{currentTrack.artist_name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" fill="currentColor" />
                ) : (
                  <Play className="w-8 h-8 ml-0.5" fill="currentColor" />
                )}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 bg-white/20 w-full">
            <div 
              className="h-full bg-white transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </>
  );
};
