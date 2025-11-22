import { Home, Search, Library, Menu, User, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
    setIsOpen(false);
  };

  // Helper to determine active state
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* --- TOP HEADER (Spotify Style) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 pt-4 px-4 bg-gradient-to-b from-background to-transparent">
        <div className="flex items-center gap-4 mb-2">
          {/* Profile Icon (Triggers Sidebar) */}
          <button 
            onClick={() => setIsOpen(true)}
            className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-transparent hover:border-primary transition-all"
          >
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </button>

          {/* Filter Pills (Visual only based on screenshot) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <span className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium whitespace-nowrap cursor-pointer hover:bg-secondary/80">
              All
            </span>
            <span className="px-4 py-1.5 rounded-full bg-transparent border border-border text-muted-foreground text-xs font-medium whitespace-nowrap cursor-pointer hover:bg-secondary/50">
              Music
            </span>
            <span className="px-4 py-1.5 rounded-full bg-transparent border border-border text-muted-foreground text-xs font-medium whitespace-nowrap cursor-pointer hover:bg-secondary/50">
              Podcasts
            </span>
          </div>
        </div>
      </div>

      {/* --- SIDEBAR OVERLAY (Settings/Menu) --- */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.email ? user.email.charAt(0).toUpperCase() : <User />}
              </div>
              <div>
                <p className="font-semibold">{user?.email?.split('@')[0] || 'Guest'}</p>
                <p className="text-xs text-muted-foreground">View Profile</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/')}>
              <Settings className="w-5 h-5" /> Settings
            </Button>
          </div>

          <div className="mt-auto pt-6 border-t border-border">
            {user ? (
              <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-5 h-5" /> Sign Out
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- BOTTOM NAVIGATION (Spotify Style) --- */}
      {/* Note: If you have a mini-player, place it immediately BEFORE this div with z-index 40 and bottom-[60px] */}
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around pb-4 pt-3 px-2">
          {/* Home */}
          <button
            onClick={() => navigate('/')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors duration-200",
              isActive('/') ? "text-white" : "text-muted-foreground hover:text-white"
            )}
          >
            <Home className={cn("w-6 h-6", isActive('/') && "fill-current")} />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          {/* Search */}
          <button
            onClick={() => navigate('/search')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors duration-200",
              isActive('/search') ? "text-white" : "text-muted-foreground hover:text-white"
            )}
          >
            <Search className={cn("w-6 h-6", isActive('/search') && "stroke-[3px]")} />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          {/* Library */}
          <button
            onClick={() => navigate('/library')} // Assuming you have a route for this
            className={cn(
              "flex flex-col items-center gap-1 transition-colors duration-200",
              isActive('/library') ? "text-white" : "text-muted-foreground hover:text-white"
            )}
          >
            <Library className={cn("w-6 h-6", isActive('/library') && "fill-current")} />
            <span className="text-[10px] font-medium">Your Library</span>
          </button>
          
          {/* Premium/Profile (Optional - to match 4 items in screenshot) */}
           {/* You can remove this if you only want 3 items */}
           <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 transition-colors duration-200 text-muted-foreground hover:text-white"
          >
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>
    </>
  );
};
