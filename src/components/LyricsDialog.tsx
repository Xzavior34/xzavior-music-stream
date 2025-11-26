import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Music2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LyricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LyricsDialog = ({ open, onOpenChange }: LyricsDialogProps) => {
  const { currentTrack, progress } = useAudio();
  const [lyrics, setLyrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (open && currentTrack) {
      fetchLyrics();
    }
  }, [open, currentTrack?.id]);

  // Sync lyrics with playback progress
  useEffect(() => {
    if (lyrics?.lines && currentTrack) {
      const currentTime = (progress / 100) * currentTrack.duration;
      const activeIndex = lyrics.lines.findLastIndex(
        (line: any) => line.time <= currentTime
      );
      if (activeIndex !== -1 && activeIndex !== currentLineIndex) {
        setCurrentLineIndex(activeIndex);
      }
    }
  }, [progress, lyrics, currentTrack]);

  const fetchLyrics = async () => {
    if (!currentTrack) return;

    setLoading(true);
    setError(null);

    try {
      // Call the edge function to get lyrics
      const { data, error: functionError } = await supabase.functions.invoke('get-lyrics', {
        body: {
          title: currentTrack.title,
          artist: currentTrack.artist_name,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.lyrics) {
        setLyrics(data.lyrics);
      } else {
        setError('Lyrics not found for this track');
      }
    } catch (err) {
      console.error('Error fetching lyrics:', err);
      setError('Failed to load lyrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentTrack) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{currentTrack.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{currentTrack.artist_name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6 min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading lyrics...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchLyrics} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && lyrics?.lines && (
            <div className="space-y-4 py-4 animate-fade-in">
              {lyrics.lines.map((line: any, index: number) => (
                <p
                  key={index}
                  className={`text-lg leading-relaxed transition-all duration-300 ${
                    index === currentLineIndex
                      ? 'text-primary font-bold scale-105'
                      : index < currentLineIndex
                      ? 'text-muted-foreground'
                      : 'text-foreground/80'
                  }`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          )}

          {!loading && !error && !lyrics && (
            <div className="flex flex-col items-center justify-center py-20">
              <Music2 className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No lyrics available for this track</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};