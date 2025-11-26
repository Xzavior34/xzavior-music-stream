import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { SongUpload } from "@/components/SongUpload";
import { useState } from "react";
import { Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export default function Create() {
  const { user } = useAuth();
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Real-time subscriptions for playlists and tracks
  useRealtimeSubscription('playlists', ['playlists'], user?.id);
  useRealtimeSubscription('tracks', ['tracks'], user?.id);

  const handleCreatePlaylist = async () => {
    if (!user || !playlistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from("playlists").insert({
        title: playlistName.trim(),
        description: playlistDescription.trim() || null,
        user_id: user.id,
        is_public: true,
      });

      if (error) throw error;

      toast.success("Playlist created successfully!");
      setPlaylistName("");
      setPlaylistDescription("");
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      toast.error(error.message || "Failed to create playlist");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-16 lg:pt-8 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto py-12 space-y-8">
            <h1 className="text-3xl font-bold">Create</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <div className="bg-card p-6 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                    <List className="w-12 h-12 text-primary mb-4" />
                    <h2 className="text-xl font-bold mb-2">Create Playlist</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Build your own collection of favorite songs
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Playlist
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Playlist Name</Label>
                      <Input
                        id="name"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder="My Awesome Playlist"
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={playlistDescription}
                        onChange={(e) => setPlaylistDescription(e.target.value)}
                        placeholder="Describe your playlist..."
                        disabled={isCreating}
                      />
                    </div>
                    <Button
                      onClick={handleCreatePlaylist}
                      disabled={isCreating || !playlistName.trim()}
                      className="w-full"
                    >
                      {isCreating ? "Creating..." : "Create Playlist"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Upload Your Music</h2>
              <SongUpload />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
