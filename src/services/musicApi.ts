// Unified Music API - JioSaavn (primary) with Deezer fallback
const JIOSAAVN_BASE = 'https://saavn.dev/api';
const JIOSAAVN_FALLBACK = 'https://jiosaavn-api-privatecv.vercel.app';
const DEEZER_API_BASE = 'https://api.deezer.com';
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
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
  source: 'jiosaavn' | 'deezer';
  isPreview: boolean;
}

export const musicApi = {
  // Search tracks with primary and fallback
  searchTracks: async (query: string): Promise<UnifiedTrack[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    
    // Try JioSaavn primary
    try {
      const url = `${JIOSAAVN_BASE}/search/songs?query=${encodeURIComponent(trimmedQuery)}&limit=20`;
      const data = await fetchWithTimeout(url, 8000);
      
      if (data?.data?.results && Array.isArray(data.data.results) && data.data.results.length > 0) {
        const tracks = data.data.results
          .map((track: any) => {
            // Validate required fields
            if (!track.id || !track.name || !track.primaryArtists) {
              return null;
            }

            // Get best quality audio URL
            const audioUrl = track.downloadUrl?.[4]?.url || 
                           track.downloadUrl?.[3]?.url || 
                           track.downloadUrl?.[track.downloadUrl?.length - 1]?.url;
            
            // Get best quality image
            const imageUrl = track.image?.[2]?.url || 
                           track.image?.[1]?.url || 
                           track.image?.[0]?.url;

            if (!audioUrl) {
              return null;
            }

            return {
              id: track.id,
              title: track.name,
              artist: track.primaryArtists,
              duration: track.duration || 0,
              audioUrl: audioUrl,
              imageUrl: imageUrl || '',
              albumTitle: track.album?.name || '',
              source: 'jiosaavn' as const,
              isPreview: false,
            };
          })
          .filter((track: UnifiedTrack | null): track is UnifiedTrack => track !== null);

        if (tracks.length > 0) {
          return tracks;
        }
      }
    } catch (error) {
      console.warn('JioSaavn primary failed:', error);
    }

    // Try JioSaavn fallback
    try {
      const url = `${JIOSAAVN_FALLBACK}/search/songs?query=${encodeURIComponent(trimmedQuery)}&limit=20`;
      const data = await fetchWithTimeout(url, 8000);
      
      if (data?.data?.results && Array.isArray(data.data.results) && data.data.results.length > 0) {
        const tracks = data.data.results
          .map((track: any) => {
            if (!track.id || !track.name || !track.primaryArtists) {
              return null;
            }

            const audioUrl = track.downloadUrl?.[4]?.url || 
                           track.downloadUrl?.[3]?.url || 
                           track.downloadUrl?.[track.downloadUrl?.length - 1]?.url;
            
            const imageUrl = track.image?.[2]?.url || 
                           track.image?.[1]?.url || 
                           track.image?.[0]?.url;

            if (!audioUrl) {
              return null;
            }

            return {
              id: track.id,
              title: track.name,
              artist: track.primaryArtists,
              duration: track.duration || 0,
              audioUrl: audioUrl,
              imageUrl: imageUrl || '',
              albumTitle: track.album?.name || '',
              source: 'jiosaavn' as const,
              isPreview: false,
            };
          })
          .filter((track: UnifiedTrack | null): track is UnifiedTrack => track !== null);

        if (tracks.length > 0) {
          return tracks;
        }
      }
    } catch (error) {
      console.warn('JioSaavn fallback failed:', error);
    }

    // Final fallback to Deezer
    for (let proxyAttempt = 0; proxyAttempt < CORS_PROXIES.length; proxyAttempt++) {
      try {
        const proxy = getCorsProxy();
        const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(trimmedQuery)}&limit=20`;
        const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`, 8000);
        
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
                duration: track.duration || 0,
                audioUrl: track.preview,
                imageUrl: track.album?.cover_xl || track.album?.cover_medium || '',
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
        console.warn(`Deezer attempt ${proxyAttempt + 1} failed:`, error);
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
    // Try Deezer for trending since JioSaavn doesn't have a direct chart endpoint
    for (let proxyAttempt = 0; proxyAttempt < CORS_PROXIES.length; proxyAttempt++) {
      try {
        const proxy = getCorsProxy();
        const url = `${DEEZER_API_BASE}/chart/0/tracks?limit=20`;
        const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`, 8000);
        
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
                duration: track.duration || 0,
                audioUrl: track.preview,
                imageUrl: track.album?.cover_xl || track.album?.cover_medium || '',
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