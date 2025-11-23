import { Home, Search, Library, Menu, X, Play, Pause, Heart, MonitorSpeaker, Plus, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { currentTrack, isPlaying, progress, togglePlay } = useAudio();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Define the new bottom nav links to match Spotify mobile
  const navLinks = [
    { path: '/', label: 'Home', Icon: Home },
    { path: '/search', label: 'Search', Icon: Search },
    { path: '/library', label: 'Your Library', Icon: Library },
    { path: '/premium', label: 'Premium', Icon: Sparkles },
    { path: '/create', label: 'Create', Icon: Plus },
  ];

  return (
    <>
      {/* --- TOP HEADER (Unchanged, retained for context) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm pt-3 pb-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Profile Icon (Triggers Sidebar) - The 'P' in your screenshot */}
            <button 
              onClick={() => setIsOpen(true)}
              className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : "X"}
            </button>
            
            {/* Brand Name restored */}
            <h1 className="text-xl font-bold text-primary tracking-tight">
              xzavior
            </h1>
          </div>
          
          <ThemeToggle />
        </div>
      </div>

      {/* --- SIDEBAR (Hidden by default) (Unchanged, retained for context) --- */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-lg">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5" />
                </Button>
            </div>
            {/* Sidebar Links */}
            <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/'); setIsOpen(false); }}>
                    <Home className="mr-2 w-5 h-5" /> Home
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/search'); setIsOpen(false); }}>
                    <Search className="mr-2 w-5 h-5" /> Search
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/library'); setIsOpen(false); }}>
                    <Library className="mr-2 w-5 h-5" /> Library
                </Button>
            </nav>
            
            <div className="mt-auto border-t pt-4">
                 <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-destructive">
                    Sign Out
                </Button>
            </div>
        </div>
      </div>

      {/* --- FLOATING MINI PLAYER --- */}
      {currentTrack && (
        <div 
          onClick={() => navigate('/now-playing')}
          className="lg:hidden fixed bottom-[62px] left-2 right-2 z-40 bg-primary text-primary-foreground rounded-lg shadow-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between p-3 h-16">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              {/* Album Art */}
              <div className="w-12 h-12 bg-black/20 rounded flex-shrink-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-white/20 to-white/5" />
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="text-sm font-semibold truncate">{currentTrack.title}</span>
                <span className="text-xs opacity-90 truncate">{currentTrack.artist_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 pl-3">
              <MonitorSpeaker className="w-5 h-5 opacity-80" />
              <Heart className="w-5 h-5 opacity-80" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" fill="currentColor" />
                ) : (
                  <Play className="w-7 h-7" fill="currentColor" />
                )}
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-[3px] bg-white/20 w-full">
            <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION (SPOTIFY-LIKE DESIGN) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-[62px]">
        <div className="flex items-center justify-around h-full px-1">
          {navLinks.map(({ path, label, Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-1",
                isActive(path) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon 
                className="w-6 h-6" 
                fill={isActive(path) && (label === 'Home' || label === 'Your Library') ? 'currentColor' : 'none'}
                strokeWidth={isActive(path) ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
