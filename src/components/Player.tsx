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
        className="hidden lg:block fixed bottom-0 left-0 right-0 z-50 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setShowNowPlaying(true)}
      >
        <div className="bg-primary text-primary-foreground shadow-2xl">
          <div className="flex items-center justify-between px-6 h-20">
            <div className="flex items-center gap-4 overflow-hidden flex-1 max-w-md">
              <div className="w-14 h-14 rounded-md flex-shrink-0 overflow-hidden shadow-lg">
                {currentTrack.image_url ? (
                  <img 
                    src={currentTrack.image_url} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                    <Play className="w-6 h-6 opacity-50" />
                  </div>
                )}
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="font-semibold truncate text-base">{currentTrack.title}</span>
                <span className="text-sm opacity-80 truncate">{currentTrack.artist_name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="hover:scale-110 active:scale-95 transition-transform touch-manipulation"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" fill="currentColor" />
                ) : (
                  <Play className="w-7 h-7 ml-0.5" fill="currentColor" />
                )}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 bg-white/20 w-full">
            <div 
              className="h-full bg-white transition-all duration-300 ease-linear" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </>
  );
};
