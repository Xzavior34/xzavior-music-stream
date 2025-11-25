import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Track {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  duration: number;
  album_id?: string;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Track[];
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
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [queue, setQueue] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgressState((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener('ended', () => {
      skipNext();
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playTrack = async (track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);

      // Log to listening history
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
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      playTrack(nextTrack);
    } else {
      setIsPlaying(false);
    }
  };

  const skipPrevious = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
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

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        queue,
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
      }}
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
