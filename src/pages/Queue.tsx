import { Queue as QueueComponent } from '@/components/Queue';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { Player } from '@/components/Player';

const Queue = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <QueueComponent />
      </main>
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64">
        <Player />
      </div>
      <MobileNav />
    </div>
  );
};

export default Queue;
