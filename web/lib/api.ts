import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_art: string | null;
  duration: number;
  file_path?: string;
}

export interface PlayerStatus {
  is_playing: boolean;
  current_track: Track | null;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: string;
  queue_length: number;
}

export interface SearchResult {
  tracks: any[];
}

// API Methods
export const playerAPI = {
  // Playback
  play: (trackId: string) => api.post(`/play/${trackId}`),
  pause: () => api.post('/pause'),
  resume: () => api.post('/resume'),
  stop: () => api.post('/stop'),
  next: () => api.post('/next'),
  
  // Position
  getPosition: () => api.get('/position'),
  seek: (position: number) => api.post(`/seek/${position}`),
  
  // Volume
  setVolume: (level: number) => api.post(`/volume/${level}`),
  getVolume: () => api.get('/volume'),
  
  // Shuffle & Repeat
  toggleShuffle: () => api.post('/shuffle/toggle'),
  cycleRepeat: () => api.post('/repeat/cycle'),
  
  // Status
  getStatus: () => api.get<PlayerStatus>('/status'),
  
  // Search
  search: (query: string, limit = 20) => api.get<SearchResult>('/search', { params: { q: query, limit } }),
  
  // Track info
  getTrack: (trackId: string) => api.get(`/track/${trackId}`),
  
  // Queue
  addToQueue: (trackId: string) => api.post(`/queue/add/${trackId}`),
  getQueue: () => api.get('/queue'),
  clearQueue: () => api.post('/queue/clear'),
  
  // Favorites
  getFavorites: (limit = 100, offset = 0) => api.get('/favorites', { params: { limit, offset } }),
  addFavorite: (trackId: string) => api.post(`/favorites/${trackId}`),
  removeFavorite: (trackId: string) => api.delete(`/favorites/${trackId}`),
  checkFavorite: (trackId: string) => api.get(`/favorites/check/${trackId}`),
  
  // History
  getHistory: (limit = 50, offset = 0) => api.get('/history', { params: { limit, offset } }),
  getRecentTracks: (limit = 20) => api.get('/history/recent', { params: { limit } }),
  getMostPlayed: (limit = 20) => api.get('/history/most-played', { params: { limit } }),
  
  // Playlists
  getPlaylists: (limit = 50) => api.get('/playlists', { params: { limit } }),
  getPlaylistTracks: (playlistId: string) => api.get(`/playlist/${playlistId}`),
  downloadPlaylist: (playlistId: string) => api.post(`/playlist/download/${playlistId}`),
  getPlaylistProgress: (playlistId: string) => api.get(`/playlist/download/progress/${playlistId}`),
  
  // Equalizer
  getEqualizer: () => api.get('/equalizer'),
  setEqualizerBand: (band: string, value: number) => api.post(`/equalizer/band/${band}/${value}`),
  loadEqualizerPreset: (preset: string) => api.post(`/equalizer/preset/${preset}`),
  getEqualizerPresets: () => api.get('/equalizer/presets'),
  toggleEqualizer: () => api.post('/equalizer/toggle'),
  
  // Visualizer
  getVisualizer: () => api.get('/visualizer'),
  toggleVisualizer: () => api.post('/visualizer/toggle'),
  setVisualizerSmoothing: (factor: number) => api.post(`/visualizer/smoothing/${factor}`),
  
  // Statistics
  getStatistics: () => api.get('/statistics'),
  
  // Cache
  getCacheStats: () => api.get('/cache/stats'),
};

export default api;