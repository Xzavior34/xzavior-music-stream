import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { AlbumCard } from "@/components/AlbumCard";
import { PlaylistCard } from "@/components/PlaylistCard";
import album1 from "@/assets/album1.jpg";
import album2 from "@/assets/album2.jpg";
import album3 from "@/assets/album3.jpg";
import album4 from "@/assets/album4.jpg";
import playlist1 from "@/assets/playlist1.jpg";
import playlist2 from "@/assets/playlist2.jpg";

const Index = () => {
  const albums = [
    { id: 1, title: "Neon Dreams", artist: "Electric Pulse", imageUrl: album1 },
    { id: 2, title: "Urban Tales", artist: "Street Poets", imageUrl: album2 },
    { id: 3, title: "Golden Hour", artist: "Sunset Riders", imageUrl: album3 },
    { id: 4, title: "Midnight Jazz", artist: "The Blue Notes", imageUrl: album4 },
    { id: 5, title: "Synthwave Vol. 1", artist: "Retro Beats", imageUrl: album1 },
    { id: 6, title: "Bass & Beats", artist: "Underground Sound", imageUrl: album2 },
  ];

  const playlists = [
    { id: 1, title: "Chill Vibes", description: "Relax and unwind with smooth beats", imageUrl: playlist1 },
    { id: 2, title: "Workout Energy", description: "High energy tracks to power your workout", imageUrl: playlist2 },
    { id: 3, title: "Focus Flow", description: "Stay focused with ambient sounds", imageUrl: playlist1 },
    { id: 4, title: "Night Drive", description: "Perfect soundtrack for late night cruising", imageUrl: playlist2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 flex-shrink-0" />
      
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Good evening</h1>
            <p className="text-muted-foreground">Your favorite tracks are waiting</p>
          </div>

          {/* Featured Albums */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular Albums</h2>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Show all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  title={album.title}
                  artist={album.artist}
                  imageUrl={album.imageUrl}
                />
              ))}
            </div>
          </section>

          {/* Featured Playlists */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Made For You</h2>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Show all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  title={playlist.title}
                  description={playlist.description}
                  imageUrl={playlist.imageUrl}
                />
              ))}
            </div>
          </section>

          {/* Recently Played */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently Played</h2>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Show all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {albums.slice(0, 4).map((album) => (
                <AlbumCard
                  key={`recent-${album.id}`}
                  title={album.title}
                  artist={album.artist}
                  imageUrl={album.imageUrl}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Player />
    </div>
  );
};

export default Index;
