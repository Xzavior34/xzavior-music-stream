import { supabase } from "@/integrations/supabase/client";
import { deezerApi, DeezerAlbum, DeezerPlaylist } from "./deezerApi";

interface LocalAlbum {
  id: string;
  title: string;
  artist_name: string;
  image_url: string;
  release_year?: number;
}

interface LocalPlaylist {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

export const musicService = {
  // Get albums with API fallback to database
  getAlbums: async (): Promise<any[]> => {
    try {
      const deezerAlbums = await deezerApi.getChartAlbums();
      if (deezerAlbums && deezerAlbums.length > 0) {
        return deezerAlbums;
      }
    } catch (error) {
      console.error('Deezer API failed, falling back to database:', error);
    }

    // Fallback to database
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .limit(12);

    if (error) {
      console.error('Database fallback failed:', error);
      return [];
    }

    return data.map((album: LocalAlbum) => ({
      id: album.id,
      title: album.title,
      artist: { name: album.artist_name },
      cover_xl: album.image_url,
      cover_medium: album.image_url,
    }));
  },

  // Get playlists with API fallback to database
  getPlaylists: async (): Promise<any[]> => {
    try {
      const deezerPlaylists = await deezerApi.getEditorialPlaylists();
      if (deezerPlaylists && deezerPlaylists.length > 0) {
        return deezerPlaylists;
      }
    } catch (error) {
      console.error('Deezer API failed, falling back to database:', error);
    }

    // Fallback to database
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('is_public', true)
      .limit(8);

    if (error) {
      console.error('Database fallback failed:', error);
      return [];
    }

    return data.map((playlist: LocalPlaylist) => ({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description || 'Curated playlist',
      picture_xl: playlist.image_url,
      picture_medium: playlist.image_url,
    }));
  },
};
