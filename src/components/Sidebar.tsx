import { Home, Search, Library, Plus, Heart, LogOut, LogIn, Crown, User, Compass } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  // Helper to determine button style based on active state
  const getButtonClass = (path: string) => cn(
    "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-colors text-sidebar-foreground",
    isActive(path) ? "bg-sidebar-accent font-bold" : "hover:bg-sidebar-accent font-semibold"
  );

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
          xzavior
        </h1>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          <button onClick={() => navigate('/')} className={getButtonClass('/')}>
            <Home className="w-6 h-6" />
            <span>Home</span>
          </button>
          
          <button onClick={() => navigate('/search')} className={getButtonClass('/search')}>
            <Search className="w-6 h-6" />
            <span>Search</span>
          </button>
          
          <button onClick={() => navigate('/discover')} className={getButtonClass('/discover')}>
            <Compass className="w-6 h-6" />
            <span>Discover</span>
          </button>
        </div>

        {/* User Library & Collection */}
        {user && (
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Your Collection
            </h3>
            <div className="space-y-1">
              <button onClick={() => navigate('/create')} className={getButtonClass('/create')}>
                <Plus className="w-6 h-6" />
                <span>Create Playlist</span>
              </button>
              
              <button onClick={() => navigate('/library')} className={getButtonClass('/library')}>
                <Heart className="w-6 h-6 fill-primary text-primary" />
                <span>Liked Songs</span>
              </button>

              <button onClick={() => navigate('/profile')} className={getButtonClass('/profile')}>
                <User className="w-6 h-6" />
                <span>Profile</span>
              </button>
              
              <button onClick={() => navigate('/premium')} className={getButtonClass('/premium')}>
                <Crown className="w-6 h-6 text-yellow-500" />
                <span>Premium</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Footer / Settings */}
      <div className="px-3 py-2 border-t border-sidebar-border bg-sidebar/50">
        <div className="mb-2">
           <ThemeToggle />
        </div>
        
        {user ? (
          <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10">
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
