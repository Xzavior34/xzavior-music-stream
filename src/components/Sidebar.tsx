import { Home, Search, Library, Plus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">xzavior</h1>
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          <button className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Home className="w-6 h-6" />
            <span className="font-semibold">Home</span>
          </button>
          <button className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Search className="w-6 h-6" />
            <span className="font-semibold">Search</span>
          </button>
          <button className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Library className="w-6 h-6" />
            <span className="font-semibold">Your Library</span>
          </button>
        </div>

        <div className="mt-8 space-y-1">
          <button className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Create Playlist</span>
          </button>
          <button className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Heart className="w-6 h-6 fill-primary text-primary" />
            <span className="font-semibold">Liked Songs</span>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-sidebar-border">
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href="#" className="block px-4 py-2 hover:text-foreground transition-colors">My Playlist #1</a>
            <a href="#" className="block px-4 py-2 hover:text-foreground transition-colors">Chill Vibes</a>
            <a href="#" className="block px-4 py-2 hover:text-foreground transition-colors">Workout Mix</a>
            <a href="#" className="block px-4 py-2 hover:text-foreground transition-colors">Road Trip</a>
          </div>
        </div>
      </nav>
    </div>
  );
};
