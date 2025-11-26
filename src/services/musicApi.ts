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

const fetchWithTimeout = async (url: string, timeout = 8000): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
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
    // Try JioSaavn first
    try {
      const url = `${JIOSAAVN_BASE}/search/songs?query=${encodeURIComponent(query)}`;
      const data = await fetchWithTimeout(url);
      
      if (data?.data?.results && data.data.results.length > 0) {
        return data.data.results.map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.primaryArtists,
          duration: track.duration,
          audioUrl: track.downloadUrl?.[4]?.url || track.downloadUrl?.[track.downloadUrl.length - 1]?.url,
          imageUrl: track.image?.[2]?.url || track.image?.[track.image.length - 1]?.url,
          albumTitle: track.album?.name,
          source: 'jiosaavn' as const,
          isPreview: false,
        })).filter((track: UnifiedTrack) => track.audioUrl);
      }
    } catch (error) {
      console.warn('JioSaavn primary failed, trying fallback:', error);
      
      // Try JioSaavn fallback URL
      try {
        const url = `${JIOSAAVN_FALLBACK}/search/songs?query=${encodeURIComponent(query)}`;
        const data = await fetchWithTimeout(url);
        
        if (data?.data?.results && data.data.results.length > 0) {
          return data.data.results.map((track: any) => ({
            id: track.id,
            title: track.name,
            artist: track.primaryArtists,
            duration: track.duration,
            audioUrl: track.downloadUrl?.[4]?.url || track.downloadUrl?.[track.downloadUrl.length - 1]?.url,
            imageUrl: track.image?.[2]?.url || track.image?.[track.image.length - 1]?.url,
            albumTitle: track.album?.name,
            source: 'jiosaavn' as const,
            isPreview: false,
          })).filter((track: UnifiedTrack) => track.audioUrl);
        }
      } catch (fallbackError) {
        console.warn('JioSaavn fallback also failed:', fallbackError);
      }
    }
    
    // Fallback to Deezer
    try {
      const proxy = getCorsProxy();
      const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}`;
      const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`);
      
      if (data?.data && data.data.length > 0) {
        return data.data.map((track: any) => ({
          id: track.id.toString(),
          title: track.title,
          artist: track.artist.name,
          duration: track.duration,
          audioUrl: track.preview,
          imageUrl: track.album.cover_xl || track.album.cover_medium,
          albumTitle: track.album.title,
          source: 'deezer' as const,
          isPreview: true,
        }));
      }
    } catch (error) {
      console.error('Deezer fallback also failed:', error);
      
      // Try with alternate proxy
      try {
        currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
        const proxy = getCorsProxy();
        const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}`;
        const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`);
        
        if (data?.data && data.data.length > 0) {
          return data.data.map((track: any) => ({
            id: track.id.toString(),
            title: track.title,
            artist: track.artist.name,
            duration: track.duration,
            audioUrl: track.preview,
            imageUrl: track.album.cover_xl || track.album.cover_medium,
            albumTitle: track.album.title,
            source: 'deezer' as const,
            isPreview: true,
          }));
        }
      } catch (finalError) {
        console.error('All APIs failed:', finalError);
      }
    }
    
    return [];
  },

  // Get trending/chart tracks
  getChart: async (): Promise<UnifiedTrack[]> => {
    // Try Deezer for trending since JioSaavn doesn't have a direct chart endpoint
    try {
      const proxy = getCorsProxy();
      const url = `${DEEZER_API_BASE}/chart/0/tracks`;
      const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`);
      
      if (data?.data && data.data.length > 0) {
        return data.data.map((track: any) => ({
          id: track.id.toString(),
          title: track.title,
          artist: track.artist.name,
          duration: track.duration,
          audioUrl: track.preview,
          imageUrl: track.album.cover_xl || track.album.cover_medium,
          albumTitle: track.album.title,
          source: 'deezer' as const,
          isPreview: true,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch chart:', error);
      
      // Try with alternate proxy
      try {
        currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
        const proxy = getCorsProxy();
        const url = `${DEEZER_API_BASE}/chart/0/tracks`;
        const data = await fetchWithTimeout(`${proxy}${encodeURIComponent(url)}`);
        
        if (data?.data && data.data.length > 0) {
          return data.data.map((track: any) => ({
            id: track.id.toString(),
            title: track.title,
            artist: track.artist.name,
            duration: track.duration,
            audioUrl: track.preview,
            imageUrl: track.album.cover_xl || track.album.cover_medium,
            albumTitle: track.album.title,
            source: 'deezer' as const,
            isPreview: true,
          }));
        }
      } catch (finalError) {
        console.error('All chart fetch attempts failed:', finalError);
      }
    }
    
    return [];
  },
};