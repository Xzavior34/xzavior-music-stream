import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { cn } from "@/lib/utils";

export const Player = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    togglePlay,
    skipNext,
    skipPrevious,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-3 sm:px-4 py-2 flex items-center gap-3 sm:gap-4">
        {/* Artwork + info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {currentTrack.image_url ? (
              <img
                src={currentTrack.image_url}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/40 to-primary/10">
                <Play className="h-5 w-5 text-primary-foreground/70" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">
              {currentTrack.title}
            </p>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {currentTrack.artist_name}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleShuffle}
              className={cn(
                "hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors",
                shuffle && "text-primary"
              )}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={skipPrevious}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={togglePlay}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px]" />
              )}
            </button>

            <button
              onClick={skipNext}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={cn(
                "hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors relative",
                repeat !== "off" && "text-primary"
              )}
              aria-label={`Repeat: ${repeat}`}
            >
              <Repeat className="h-4 w-4" />
              {repeat === "one" && (
                <span className="absolute -top-1 -right-1 text-[9px] font-semibold">1</span>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:block w-44 md:w-64 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="sm:hidden h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
