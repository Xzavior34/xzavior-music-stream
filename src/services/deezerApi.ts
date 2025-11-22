// Deezer API service - Free music API with no authentication required
const DEEZER_API_BASE = 'https://api.deezer.com';
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

let currentProxyIndex = 0;

const getCorsProxy = () => {
  return CORS_PROXIES[currentProxyIndex];
};

const fetchWithRetry = async (url: string, retries = 2): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const proxy = getCorsProxy();
      const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      
      // Try next proxy if available
      if (i < retries - 1) {
        currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
      }
      
      if (i === retries - 1) throw error;
    }
  }
};

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
      const data = await fetchWithRetry(url);
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
      const data = await fetchWithRetry(url);
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
      const data = await fetchWithRetry(url);
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
      const data = await fetchWithRetry(url);
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
      const data = await fetchWithRetry(url);
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
      const data = await fetchWithRetry(url);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  },
};
