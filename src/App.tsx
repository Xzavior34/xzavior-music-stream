import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import AlbumDetail from "./pages/AlbumDetail";
import PlaylistDetail from "./pages/PlaylistDetail";
import Library from "./pages/Library";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { Player } from "./components/Player";

const App = () => (
  <>
    <OfflineIndicator />
    <PWAInstallPrompt />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/search" element={<Search />} />
      <Route path="/album/:id" element={<AlbumDetail />} />
      <Route path="/playlist/:id" element={<PlaylistDetail />} />
      <Route path="/library" element={<Library />} />
      <Route path="/create" element={<Create />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Player />
  </>
);

export default App;
