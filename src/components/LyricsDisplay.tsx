import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  trackId: string;
  currentTime: number;
  isPlaying: boolean;
}

export const LyricsDisplay = ({ trackId, currentTime, isPlaying }: LyricsDisplayProps) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchLyrics = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-lyrics', {
          body: { trackId }
        });

        if (error) throw error;

        if (data?.lyrics?.lines) {
          setLyrics(data.lyrics.lines);
        }
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setLyrics([
          { time: 0, text: 'Lyrics unavailable' },
          { time: 2, text: 'Enjoy the music!' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (trackId) {
      fetchLyrics();
    }
  }, [trackId]);

  useEffect(() => {
    if (!lyrics.length || !isPlaying) return;

    // Find current line based on time
    const lineIndex = lyrics.findIndex((line, index) => {
      const nextLine = lyrics[index + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    if (lineIndex !== -1 && lineIndex !== currentLine) {
      setCurrentLine(lineIndex);
      
      // Auto-scroll to current line
      if (lineRefs.current[lineIndex] && scrollRef.current) {
        lineRefs.current[lineIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentTime, lyrics, isPlaying, currentLine]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lyrics.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Music2 className="w-12 h-12 mb-4 opacity-50" />
        <p>No lyrics available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="py-12 px-6 space-y-4">
        {lyrics.map((line, index) => (
          <div
            key={index}
            ref={(el) => (lineRefs.current[index] = el)}
            className={cn(
              "text-center transition-all duration-300 py-2 px-4 rounded-lg",
              index === currentLine
                ? "text-2xl sm:text-3xl font-bold text-primary scale-105 bg-primary/10"
                : index < currentLine
                ? "text-lg sm:text-xl text-muted-foreground/60"
                : "text-lg sm:text-xl text-muted-foreground/40"
            )}
          >
            {line.text}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
