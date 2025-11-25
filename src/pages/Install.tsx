import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Download, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 pb-32 lg:pb-24">
        <MobileNav />
        
        <div className="pt-16 lg:pt-8 px-4 lg:px-8">
          <div className="max-w-2xl mx-auto py-12">
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Install Xzavior</h1>
              <p className="text-muted-foreground text-lg">
                Get the full app experience on your device
              </p>
            </div>

            {isInstalled ? (
              <Card className="p-8 text-center bg-accent/50 border-primary/20">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Already Installed!</h2>
                <p className="text-muted-foreground">
                  You're using the installed version of Xzavior
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {deferredPrompt && (
                  <Card className="p-6 bg-gradient-subtle border-primary/20">
                    <div className="flex flex-col items-center text-center gap-4">
                      <Download className="w-12 h-12 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">Ready to Install</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Install Xzavior for quick access, offline playback, and a native app experience
                        </p>
                      </div>
                      <Button
                        size="lg"
                        onClick={handleInstallClick}
                        className="w-full sm:w-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Install Now
                      </Button>
                    </div>
                  </Card>
                )}

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Installation Guide</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">On iPhone/iPad</h4>
                        <p className="text-sm text-muted-foreground">
                          Tap the share button in Safari, then select "Add to Home Screen"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">On Android</h4>
                        <p className="text-sm text-muted-foreground">
                          Tap the menu (three dots), then select "Install app" or "Add to Home screen"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">On Desktop</h4>
                        <p className="text-sm text-muted-foreground">
                          Look for the install icon in your browser's address bar, or use the button above
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-accent/50">
                  <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Works offline - listen to your downloaded music anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Faster loading - optimized for your device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Home screen access - launch like a native app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>No app store required - install directly from browser</span>
                    </li>
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
