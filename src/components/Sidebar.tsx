import { Home, Search, Library, Plus, Heart, LogOut, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>xzavior</h1>
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          <button onClick={() => navigate('/')} className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Home className="w-6 h-6" />
            <span className="font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/search')} className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Search className="w-6 h-6" />
            <span className="font-semibold">Search</span>
          </button>
          <button onClick={() => navigate('/library')} className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Library className="w-6 h-6" />
            <span className="font-semibold">Your Library</span>
          </button>
        </div>

        <div className="mt-8 space-y-1">
          <button onClick={() => navigate('/create')} className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Create Playlist</span>
          </button>
          <button onClick={() => navigate('/library')} className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Heart className="w-6 h-6 fill-primary text-primary" />
            <span className="font-semibold">Liked Songs</span>
          </button>
        </div>
      </nav>

      <div className="px-3 py-2">
        <ThemeToggle />
      </div>

      <div className="p-4 border-t border-sidebar-border">
        {user ? (
          <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <Button onClick={() => navigate('/auth')} variant="ghost" className="w-full justify-start">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
};
