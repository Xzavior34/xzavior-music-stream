// Unified Music API - Deezer (primary, reliable)
const DEEZER_API_BASE = 'https://api.deezer.com';
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
];

let currentProxyIndex = 0;

const getCorsProxy = () => {
  return CORS_PROXIES[currentProxyIndex];
};

const fetchWithTimeout = async (url: string, timeout = 10000): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
};

export interface UnifiedTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  imageUrl: string;
  albumTitle?: string;
  source: 'deezer';
  isPreview: boolean;
}

export const musicApi = {
  // Search tracks using Deezer API
  searchTracks: async (query: string): Promise<UnifiedTrack[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    
    // Try Deezer with multiple CORS proxies
    for (let proxyAttempt = 0; proxyAttempt < CORS_PROXIES.length; proxyAttempt++) {
      try {
        const proxy = getCorsProxy();
        const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(trimmedQuery)}&limit=30`;
        const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`, 10000);
        
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const tracks = data.data
            .map((track: any) => {
              if (!track.id || !track.title || !track.artist?.name || !track.preview) {
                return null;
              }

              return {
                id: track.id.toString(),
                title: track.title,
                artist: track.artist.name,
                duration: track.duration || 30,
                audioUrl: track.preview,
                imageUrl: track.album?.cover_xl || track.album?.cover_medium || track.album?.cover_big || '',
                albumTitle: track.album?.title || '',
                source: 'deezer' as const,
                isPreview: true,
              };
            })
            .filter((track: UnifiedTrack | null): track is UnifiedTrack => track !== null);

          if (tracks.length > 0) {
            return tracks;
          }
        }
      } catch (error) {
        console.warn(`Deezer search attempt ${proxyAttempt + 1} failed:`, error);
        // Try next proxy
        currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
      }
    }

    // Reset proxy index for next search
    currentProxyIndex = 0;
    
    // Return empty array if all attempts failed
    return [];
  },

  // Get trending/chart tracks
  getChart: async (): Promise<UnifiedTrack[]> => {
    for (let proxyAttempt = 0; proxyAttempt < CORS_PROXIES.length; proxyAttempt++) {
      try {
        const proxy = getCorsProxy();
        const url = `${DEEZER_API_BASE}/chart/0/tracks?limit=30`;
        const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`, 10000);
        
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const tracks = data.data
            .map((track: any) => {
              if (!track.id || !track.title || !track.artist?.name || !track.preview) {
                return null;
              }

              return {
                id: track.id.toString(),
                title: track.title,
                artist: track.artist.name,
                duration: track.duration || 30,
                audioUrl: track.preview,
                imageUrl: track.album?.cover_xl || track.album?.cover_medium || track.album?.cover_big || '',
                albumTitle: track.album?.title || '',
                source: 'deezer' as const,
                isPreview: true,
              };
            })
            .filter((track: UnifiedTrack | null): track is UnifiedTrack => track !== null);

          if (tracks.length > 0) {
            return tracks;
          }
        }
      } catch (error) {
        console.warn(`Chart fetch attempt ${proxyAttempt + 1} failed:`, error);
        // Try next proxy
        currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
      }
    }

    // Reset proxy index
    currentProxyIndex = 0;
    
    return [];
  },
};