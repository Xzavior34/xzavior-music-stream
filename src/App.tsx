import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import AlbumDetail from "./pages/AlbumDetail";
import PlaylistDetail from "./pages/PlaylistDetail";
import Library from "./pages/Library";
import Premium from "./pages/Premium";
import Create from "./pages/Create";
import NowPlaying from "./pages/NowPlaying";
import Queue from "./pages/Queue";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/search" element={<Search />} />
    <Route path="/album/:id" element={<AlbumDetail />} />
    <Route path="/playlist/:id" element={<PlaylistDetail />} />
    <Route path="/library" element={<Library />} />
    <Route path="/premium" element={<Premium />} />
    <Route path="/create" element={<Create />} />
    <Route path="/now-playing" element={<NowPlaying />} />
    <Route path="/queue" element={<Queue />} />
    <Route path="/install" element={<Install />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
