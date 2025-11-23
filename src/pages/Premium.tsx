import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Player } from "@/components/Player";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Premium() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-16 lg:pt-8 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Get Premium</h1>
            <p className="text-muted-foreground mb-8">
              Unlock unlimited music and premium features
            </p>
            
            <div className="bg-card p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-6">Premium Features</h2>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Ad-free music listening</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Download songs for offline playback</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>High-quality audio streaming</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Unlimited skips</span>
                </div>
              </div>
              <Button className="mt-8 w-full max-w-xs" size="lg">
                Get Premium
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Player />
    </div>
  );
}
