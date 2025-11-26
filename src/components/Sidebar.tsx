import { Home, Search, Library, Plus, Heart, LogOut, LogIn, User, List } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [playlists, setPlaylists] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      
      // Subscribe to playlist changes
      const channel = supabase
        .channel('sidebar-playlists')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists', filter: `user_id=eq.${user.id}` }, 
          () => fetchPlaylists()
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchPlaylists = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('playlists')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setPlaylists(data);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

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

      <ScrollArea className="flex-1 px-3">
        <nav>
          <div className="space-y-1">
            <button onClick={() => navigate('/')} className={getButtonClass('/')}>
              <Home className="w-6 h-6" />
              <span>Home</span>
            </button>
            
            <button onClick={() => navigate('/search')} className={getButtonClass('/search')}>
              <Search className="w-6 h-6" />
              <span>Search</span>
            </button>
            
            <button onClick={() => navigate('/library')} className={getButtonClass('/library')}>
              <Library className="w-6 h-6" />
              <span>Library</span>
            </button>
          </div>

          {user && (
            <>
              <div className="mt-6">
                <div className="space-y-1">
                  <button onClick={() => navigate('/create')} className={getButtonClass('/create')}>
                    <Plus className="w-6 h-6" />
                    <span>Create</span>
                  </button>

                  <button onClick={() => navigate('/profile')} className={getButtonClass('/profile')}>
                    <User className="w-6 h-6" />
                    <span>Profile</span>
                  </button>
                </div>
              </div>

              {playlists.length > 0 && (
                <div className="mt-8">
                  <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Your Playlists
                  </h3>
                  <div className="space-y-1">
                    {playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                        className={getButtonClass(`/playlist/${playlist.id}`)}
                      >
                        <List className="w-6 h-6" />
                        <span className="truncate">{playlist.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
      </ScrollArea>

      <div className="px-3 py-2 border-t border-sidebar-border bg-sidebar/50">
        <div className="mb-2">
           <ThemeToggle />
        </div>
        
        {user ? (
          <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
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
