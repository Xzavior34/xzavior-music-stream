import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Recommendation {
  title: string;
  artist: string;
  genre?: string;
  reason: string;
}

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
        <div className="grid gap-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-gradient-to-r from-muted/60 to-muted/30 border border-border/50 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{rec.title}</p>
                  <p className="text-sm text-muted-foreground">{rec.artist}</p>
                  {rec.genre && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      {rec.genre}
                    </span>
                  )}
                  <p className="text-sm mt-2 text-muted-foreground italic">
                    {rec.reason}
                  </p>
                </div>
              </div>
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