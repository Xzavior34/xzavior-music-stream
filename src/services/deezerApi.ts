// Deezer API service - Free music API with no authentication required
const DEEZER_API_BASE = 'https://api.deezer.com';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: {
    id: number;
    name: string;
    picture_medium: string;
  };
  album: {
    id: number;
    title: string;
    cover_medium: string;
    cover_xl: string;
  };
}

export interface DeezerAlbum {
  id: number;
  title: string;
  cover_medium: string;
  cover_xl: string;
  release_date: string;
  artist: {
    id: number;
    name: string;
    picture_medium: string;
  };
  tracks?: {
    data: DeezerTrack[];
  };
}

export interface DeezerPlaylist {
  id: number;
  title: string;
  description: string;
  picture_medium: string;
  picture_xl: string;
  tracks?: {
    data: DeezerTrack[];
  };
}

export const deezerApi = {
  // Search tracks
  searchTracks: async (query: string): Promise<DeezerTrack[]> => {
    try {
      const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  },

  // Get chart (popular tracks)
  getChart: async (): Promise<DeezerTrack[]> => {
    try {
      const url = `${DEEZER_API_BASE}/chart/0/tracks`;
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching chart:', error);
      return [];
    }
  },

  // Get popular albums
  getChartAlbums: async (): Promise<DeezerAlbum[]> => {
    try {
      const url = `${DEEZER_API_BASE}/chart/0/albums`;
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching albums:', error);
      return [];
    }
  },

  // Get album details
  getAlbum: async (albumId: number): Promise<DeezerAlbum | null> => {
    try {
      const url = `${DEEZER_API_BASE}/album/${albumId}`;
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching album:', error);
      return null;
    }
  },

  // Get playlist
  getPlaylist: async (playlistId: number): Promise<DeezerPlaylist | null> => {
    try {
      const url = `${DEEZER_API_BASE}/playlist/${playlistId}`;
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return null;
    }
  },

  // Get editorial playlists
  getEditorialPlaylists: async (): Promise<DeezerPlaylist[]> => {
    try {
      const url = `${DEEZER_API_BASE}/chart/0/playlists`;
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  },
};
