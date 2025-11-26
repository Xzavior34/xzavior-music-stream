import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TrackLikeButtonProps {
  trackId: string;
  trackTitle?: string;
  artistName?: string;
  audioUrl?: string;
  duration?: number;
  albumId?: string;
  className?: string;
}

const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const TrackLikeButton = ({ 
  trackId, 
  trackTitle, 
  artistName, 
  audioUrl, 
  duration, 
  albumId,
  className 
}: TrackLikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && isUuid(trackId)) {
      checkIfLiked();
    }
  }, [user, trackId]);

  const checkIfLiked = async () => {
    if (!user || !isUuid(trackId)) return;
    
    try {
      const { data, error } = await supabase
        .from('liked_tracks')
        .select('id')
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .maybeSingle();

      if (error) throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking liked status:', error);
    }
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to like songs');
      return;
    }

    if (!isUuid(trackId)) {
      toast.error('Liking this song is not available yet');
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('liked_tracks')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', trackId);

        if (error) throw error;
        setIsLiked(false);
        toast.success('Removed from liked songs');
      } else {
        // First, ensure track exists in tracks table (only for internal tracks)
        if (trackTitle && artistName && audioUrl && typeof duration === 'number') {
          const { data: existingTrack, error: existingError } = await supabase
            .from('tracks')
            .select('id')
            .eq('id', trackId)
            .maybeSingle();

          if (existingError) throw existingError;

          if (!existingTrack) {
            const { error: insertError } = await supabase
              .from('tracks')
              .insert({
                id: trackId,
                title: trackTitle,
                artist_name: artistName,
                audio_url: audioUrl,
                duration: duration,
                album_id: albumId || null,
                uploaded_by: user.id,
              });

            if (insertError) throw insertError;
          }
        }

        // Then add to liked tracks
        const { error } = await supabase
          .from('liked_tracks')
          .insert({
            user_id: user.id,
            track_id: trackId,
          });

        if (error) throw error;
        setIsLiked(true);
        toast.success('Added to liked songs');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update liked songs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={cn(
        "transition-colors",
        isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Heart
        className="w-5 h-5"
        fill={isLiked ? "currentColor" : "none"}
      />
    </button>
  );
};
