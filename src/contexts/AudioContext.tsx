import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Track {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  album_id?: string;
  image_url?: string;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Track[];
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  removeFromQueue: (index: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [queue, setQueue] = useState<Track[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCrossfadingRef = useRef(false);
  const CROSSFADE_DURATION = 3; // 3 seconds crossfade
  const isGaplessRef = useRef(false); // For gapless playback mode

  useEffect(() => {
    audioRef.current = new Audio();
    nextAudioRef.current = new Audio();
    
    const audio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgressState((audio.currentTime / audio.duration) * 100);
        
        // Start crossfade when near the end
        const timeRemaining = audio.duration - audio.currentTime;
        if (timeRemaining <= CROSSFADE_DURATION && timeRemaining > 0 && !isCrossfadingRef.current) {
          const nextTrack = queue[0];
          if (nextTrack && repeat !== 'one') {
            startCrossfade(nextTrack);
          }
        }
      }
    });

    // Handle audio errors gracefully
    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      if (queue.length > 0) {
        skipNext();
      } else {
        setIsPlaying(false);
      }
    });

    nextAudio.addEventListener('error', (e) => {
      console.error('Next audio error:', e);
      isCrossfadingRef.current = false;
    });

    return () => {
      audio.pause();
      audio.src = '';
      nextAudio.pause();
      nextAudio.src = '';
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
    };
  }, []);

  // Handle track end separately to avoid stale closure
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // If repeat one is active, replay the same track
      if (repeat === 'one' && currentTrack) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      
      // If there's a queue, play next track
      if (queue.length > 0) {
        const nextTrack = queue[0];
        setQueue(prev => prev.slice(1));
        playTrack(nextTrack);
        return;
      }
      
      // If repeat all is active, replay current track
      if (repeat === 'all' && currentTrack) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      
      // Otherwise, stop playing
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, queue, repeat]);

  useEffect(() => {
    if (audioRef.current && !isCrossfadingRef.current) {
      audioRef.current.volume = volume / 100;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = 0;
    }
  }, [volume]);

  const startCrossfade = (nextTrack: Track) => {
    if (isCrossfadingRef.current || !audioRef.current || !nextAudioRef.current) return;
    
    isCrossfadingRef.current = true;
    const currentAudio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    
    // Gapless mode: no fade, instant transition
    if (isGaplessRef.current) {
      nextAudio.src = nextTrack.audio_url;
      nextAudio.volume = volume / 100;
      nextAudio.play();
      
      // Instant swap
      currentAudio.pause();
      currentAudio.src = '';
      
      const temp = audioRef.current;
      audioRef.current = nextAudioRef.current;
      nextAudioRef.current = temp;
      
      setCurrentTrack(nextTrack);
      setQueue(prev => prev.slice(1));
      isCrossfadingRef.current = false;
      logListeningHistory(nextTrack);
      return;
    }
    
    // Crossfade mode
    nextAudio.src = nextTrack.audio_url;
    nextAudio.volume = 0;
    nextAudio.play();
    
    const startVolume = volume / 100;
    const steps = 30;
    const interval = (CROSSFADE_DURATION * 1000) / steps;
    let step = 0;
    
    const fadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      currentAudio.volume = startVolume * (1 - progress);
      nextAudio.volume = startVolume * progress;
      
      if (step >= steps) {
        clearInterval(fadeInterval);
        currentAudio.pause();
        currentAudio.src = '';
        
        const temp = audioRef.current;
        audioRef.current = nextAudioRef.current;
        nextAudioRef.current = temp;
        
        setCurrentTrack(nextTrack);
        setQueue(prev => prev.slice(1));
        isCrossfadingRef.current = false;
        logListeningHistory(nextTrack);
      }
    }, interval);
  };

  const logListeningHistory = async (track: Track) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('listening_history').insert({
          user_id: user.id,
          track_id: track.id,
        });
      }
    } catch (error) {
      console.error('Failed to log listening history:', error);
    }
  };

  const playTrack = async (track: Track) => {
    if (audioRef.current) {
      // Cancel any ongoing crossfade
      isCrossfadingRef.current = false;
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
      
      // Add current track to history before playing new track
      if (currentTrack) {
        setPlayHistory(prev => [...prev, currentTrack]);
      }
      
      audioRef.current.src = track.audio_url;
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);

      // Log to listening history
      await logListeningHistory(track);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipNext = () => {
    // Manual skip should always go to next track if available
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextTrack);
    } else if (currentTrack && (repeat === 'all' || repeat === 'one')) {
      // If no queue but repeat is on, restart current track
      playTrack(currentTrack);
    } else {
      // No queue and no repeat, just stop
      setIsPlaying(false);
    }
  };

  const skipPrevious = () => {
    if (audioRef.current) {
      // If more than 3 seconds into track, restart it
      if (audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
      } else if (playHistory.length > 0) {
        // Go to previous track in history
        const previousTrack = playHistory[playHistory.length - 1];
        setPlayHistory(playHistory.slice(0, -1));
        
        // Add current track back to queue
        if (currentTrack) {
          setQueue([currentTrack, ...queue]);
        }
        
        playTrack(previousTrack);
      } else {
        // No history, just restart
        audioRef.current.currentTime = 0;
      }
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const setProgress = (newProgress: number) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
      setProgressState(newProgress);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue([...queue, track]);
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    const result = Array.from(queue);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setQueue(result);
  };

  const removeFromQueue = (index: number) => {
    setQueue(queue.filter((_, i) => i !== index));
  };

  const toggleShuffle = () => {
    const newShuffleState = !shuffle;
    setShuffle(newShuffleState);
    
    if (newShuffleState && queue.length > 0) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    }
  };

  const toggleRepeat = () => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        queue,
        shuffle,
        repeat,
        playTrack,
        togglePlay,
        skipNext,
        skipPrevious,
        setVolume,
        setProgress,
        addToQueue,
        clearQueue,
        reorderQueue,
        removeFromQueue,
        toggleShuffle,
        toggleRepeat,
        getAudioElement: () => audioRef.current,
      } as any}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

// Export audio element ref for visualizer
export const useAudioElement = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioElement must be used within AudioProvider');
  }
  // Access the internal audio ref through a custom method
  return (context as any).getAudioElement?.() || null;
};
