import { Home, Search, Library, Menu, X, Play, Heart, MonitorSpeaker, Plus, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

  const isActive = (path: string) => location.pathname === path;

  // Define the new bottom nav links
  const navLinks = [
    { path: '/', label: 'Home', Icon: Home },
    { path: '/search', label: 'Search', Icon: Search },
    { path: '/library', label: 'Your Library', Icon: Library },
    { path: '/premium', label: 'Premium', Icon: Sparkles }, // Using Sparkles for Premium
    { path: '/create', label: 'Create', Icon: Plus }, // Placeholder for Create/Liked
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

      {/* --- FLOATING MINI PLAYER (Unchanged, retained for context) --- */}
      <div className="lg:hidden fixed bottom-[62px] left-2 right-2 z-40 bg-primary text-primary-foreground rounded-md shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-2 h-14">
          <div className="flex items-center gap-3 overflow-hidden">
             {/* Album Art Placeholder */}
            <div className="w-10 h-10 bg-black/20 rounded flex-shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold truncate">Mortals Funk Remix</span>
              <span className="text-xs opacity-80 truncate">LXNGVX</span>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-2">
             <MonitorSpeaker className="w-5 h-5 opacity-70" />
             <Heart className="w-5 h-5 opacity-70" />
             <Play className="w-6 h-6 fill-current" />
          </div>
        </div>
        {/* Progress bar line at bottom of player */}
        <div className="h-[2px] bg-white/20 w-full">
            <div className="h-full bg-white w-1/3" />
        </div>
      </div>

      {/* --- BOTTOM NAVIGATION (MODIFIED TO MATCH MOBILE APP DESIGN) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-gray-800 h-[60px]">
        <div className="flex items-center justify-around h-full px-2">
          {navLinks.map(({ path, label, Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              // The active path determines the icon fill/weight and text color
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 pt-1",
                isActive(path) ? "text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <Icon 
                className="w-6 h-6" 
                // Fill the icon for Home and Library if active, like in the screenshot
                fill={isActive(path) && (label === 'Home' || label === 'Your Library') ? 'currentColor' : 'none'}
                // Use bolder stroke for Search icon when active
                strokeWidth={isActive(path) && label === 'Search' ? 3 : 2}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
