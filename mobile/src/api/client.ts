import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_art: string | null;
  duration: number;
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

export const playerAPI = {
  // Playback
  play: (trackId: string) => api.post(`/play/${trackId}`),
  pause: () => api.post('/pause'),
  resume: () => api.post('/resume'),
  stop: () => api.post('/stop'),
  next: () => api.post('/next'),
  
  // Position
  seek: (position: number) => api.post(`/seek/${position}`),
  getPosition: () => api.get('/position'),
  
  // Volume
  setVolume: (level: number) => api.post(`/volume/${level}`),
  getVolume: () => api.get('/volume'),
  
  // Shuffle & Repeat
  toggleShuffle: () => api.post('/shuffle/toggle'),
  cycleRepeat: () => api.post('/repeat/cycle'),
  
  // Status
  getStatus: () => api.get<PlayerStatus>('/status'),
  
  // Search
  search: (query: string, limit = 20) => 
    api.get('/search', { params: { q: query, limit } }),
  
  // Queue
  addToQueue: (trackId: string) => api.post(`/queue/add/${trackId}`),
  getQueue: () => api.get('/queue'),
  clearQueue: () => api.post('/queue/clear'),
  
  // Favorites
  getFavorites: (limit = 100, offset = 0) => 
    api.get('/favorites', { params: { limit, offset } }),
  addFavorite: (trackId: string) => api.post(`/favorites/${trackId}`),
  removeFavorite: (trackId: string) => api.delete(`/favorites/${trackId}`),
  checkFavorite: (trackId: string) => api.get(`/favorites/check/${trackId}`),
  
  // History
  getHistory: (limit = 50, offset = 0) => 
    api.get('/history', { params: { limit, offset } }),
  getRecentTracks: (limit = 20) => 
    api.get('/history/recent', { params: { limit } }),
  
  // Playlists
  getPlaylists: (limit = 50) => 
    api.get('/playlists', { params: { limit } }),
  getPlaylistTracks: (playlistId: string) => 
    api.get(`/playlist/${playlistId}`),
};

export default api;