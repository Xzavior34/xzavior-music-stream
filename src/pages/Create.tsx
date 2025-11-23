import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Player } from "@/components/Player";
import { Plus, List, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Create() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-16 lg:pt-8 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto py-12">
            <h1 className="text-3xl font-bold mb-8">Create</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
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
              
              <div className="bg-card p-6 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <Music className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-xl font-bold mb-2">Upload Music</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your own music with the world
                </p>
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Track
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Player />
    </div>
  );
}
