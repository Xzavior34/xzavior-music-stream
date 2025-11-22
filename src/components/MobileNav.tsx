import { Home, Search, Library, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
            xzavior
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed top-[65px] left-0 bottom-[90px] z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col h-full p-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }}
              className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              <Home className="w-6 h-6" />
              <span className="font-semibold">Home</span>
            </button>
            <button
              onClick={() => {
                navigate('/search');
                setIsOpen(false);
              }}
              className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              <Search className="w-6 h-6" />
              <span className="font-semibold">Search</span>
            </button>
            <button className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
              <Library className="w-6 h-6" />
              <span className="font-semibold">Your Library</span>
            </button>
          </div>

          <div className="mt-auto pt-4 border-t border-sidebar-border">
            {user ? (
              <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => {
                  navigate('/auth');
                  setIsOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start"
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-[90px] left-0 right-0 z-30 bg-sidebar/95 backdrop-blur-sm border-t border-sidebar-border">
        <div className="flex items-center justify-around p-2">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
            <Library className="w-6 h-6" />
            <span className="text-xs font-medium">Library</span>
          </button>
        </div>
      </div>
    </>
  );
};
