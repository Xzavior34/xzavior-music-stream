import { Play, Music } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  title: string;
  description: string;
  imageUrl: string;
  className?: string;
}

export const PlaylistCard = ({ title, description, imageUrl, className }: PlaylistCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl bg-gradient-to-b from-card to-card/80 hover:from-card hover:to-muted/30 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:scale-[1.02] animate-fade-in",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover shadow-xl transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
            <Music className="w-16 h-16 text-primary/60" />
          </div>
        )}
        <button
          className={cn(
            "absolute bottom-3 right-3 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center shadow-premium transition-all duration-300 hover:scale-110",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          )}
        >
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </button>
      </div>
      <div>
        <h3 className="font-bold text-sm mb-1 truncate group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </div>
  );
};
