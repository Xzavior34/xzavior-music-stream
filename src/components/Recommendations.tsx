import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Sparkles, Loader2, Play, Music } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";

interface Recommendation {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  preview_url: string;
  duration: number;
  album: string;
}

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { playTrack } = useAudio();

  const fetchRecommendations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-recommendations');

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      
      if (data.message) {
        toast.info(data.message);
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const handlePlayTrack = (rec: Recommendation) => {
    playTrack({
      id: rec.id,
      title: rec.title,
      artist_name: rec.artist,
      audio_url: rec.preview_url,
      duration: rec.duration,
      image_url: rec.image_url,
    });
  };

  if (!user) return null;

  return (
    <section className="mb-8 lg:mb-12">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">AI Recommendations</h2>
        </div>
        <Button 
          onClick={fetchRecommendations} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {loading && recommendations.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="group cursor-pointer"
              onClick={() => handlePlayTrack(rec)}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3 group-hover:shadow-lg transition-all">
                {rec.image_url ? (
                  <img 
                    src={rec.image_url} 
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
                    <Music className="w-12 h-12 text-primary/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold truncate text-sm group-hover:text-primary transition-colors">{rec.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{rec.artist}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          Start liking songs to get personalized recommendations!
        </p>
      )}
    </section>
  );
};