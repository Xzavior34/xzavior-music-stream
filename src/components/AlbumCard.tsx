import { Play } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AlbumCardProps {
  title: string;
  artist: string;
  imageUrl: string;
  className?: string;
}

export const AlbumCard = ({ title, artist, imageUrl, className }: AlbumCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "group relative p-4 rounded-lg bg-card hover:bg-card/80 transition-all duration-300 cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mb-4 aspect-square">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
        <button
          className={cn(
            "absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        </button>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-1 truncate">{title}</h3>
        <p className="text-xs text-muted-foreground truncate">{artist}</p>
      </div>
    </div>
  );
};
