import { 
  Home, 
  Search, 
  Library, 
  Menu, 
  X, 
  Play, 
  Pause, 
  Heart, 
  MonitorSpeaker, 
  Plus, 
  User, 
  LogOut
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";
import { NowPlayingDialog } from "@/components/NowPlayingDialog";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
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

  // Helper to navigate and close the menu
  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Bottom Navigation Bar items
  const navLinks = [
    { path: '/', label: 'Home', Icon: Home },
    { path: '/search', label: 'Search', Icon: Search },
    { path: '/library', label: 'Library', Icon: Library },
    { path: '/create', label: 'Create', Icon: Plus },
  ];

  return (
    <>
      <NowPlayingDialog open={showNowPlaying} onOpenChange={setShowNowPlaying} />
      
      {/* --- TOP HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm pt-3 pb-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Profile Icon (Triggers Sidebar Menu) */}
            <button 
              onClick={() => setIsOpen(true)}
              className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : "X"}
            </button>
            
            <h1 className="text-xl font-bold text-primary tracking-tight">
              xzavior
            </h1>
          </div>
          
          <ThemeToggle />
        </div>
      </div>

      {/* --- SIDEBAR OVERLAY (Black background) --- */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- SLIDE-OUT SIDEBAR MENU --- */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border/50">
            <span className="font-bold text-lg">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
            </Button>
        </div>

        {/* SCROLLABLE MENU CONTENT */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
            {/* Section 1: Main */}
            <div className="space-y-1 mb-6">
                <Button variant="ghost" className="w-full justify-start gap-4" onClick={() => handleNavClick('/')}>
                    <Home className="w-5 h-5" /> Home
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-4" onClick={() => handleNavClick('/search')}>
                    <Search className="w-5 h-5" /> Search
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-4" onClick={() => handleNavClick('/library')}>
                    <Library className="w-5 h-5" /> Library
                </Button>
            </div>

            {/* Section 2: User Actions */}
            {user && (
              <div>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start gap-4" onClick={() => handleNavClick('/create')}>
                      <Plus className="w-5 h-5" /> Create
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-4" onClick={() => handleNavClick('/profile')}>
                      <User className="w-5 h-5" /> Profile
                  </Button>
                </div>
              </div>
            )}
        </div>
            
        {/* Footer: Sign Out */}
        <div className="p-4 border-t border-sidebar-border">
             {user ? (
               <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10 gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
              </Button>
             ) : (
              <Button onClick={() => handleNavClick('/auth')} variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" /> Sign In
              </Button>
             )}
        </div>
      </div>

      {/* --- FLOATING MINI PLAYER --- */}
      {currentTrack && (
        <div 
          className="lg:hidden fixed bottom-[62px] left-2 right-2 z-40 bg-primary text-primary-foreground rounded-lg shadow-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => setShowNowPlaying(true)}
        >
          <div className="flex items-center justify-between p-3 h-16">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden">
                {currentTrack.image_url ? (
                  <img 
                    src={currentTrack.image_url} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5" />
                )}
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="text-sm font-semibold truncate">{currentTrack.title}</span>
                <span className="text-xs opacity-90 truncate">{currentTrack.artist_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-3">
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
          <div className="h-[3px] bg-white/20 w-full">
            <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION BAR --- */}
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
                fill={isActive(path) && (label === 'Home' || label === 'Library') ? 'currentColor' : 'none'}
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
