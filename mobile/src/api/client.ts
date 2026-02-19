import axios from 'axios';
import type { Track, PlayerStatus } from '../types';

const API_URL = 'http://localhost:8000'; // Change to your backend URL

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Search
export const searchTracks = async (query: string): Promise<Track[]> => {
  const response = await api.get('/search', { params: { q: query, limit: 20 } });
  return response.data.tracks;
};

// Playback
export const playTrack = async (trackId: string) => {
  const response = await api.post(`/play/${trackId}`);
  return response.data;
};

export const pausePlayback = async () => {
  const response = await api.post('/pause');
  return response.data;
};

export const resumePlayback = async () => {
  const response = await api.post('/resume');
  return response.data;
};

export const playNext = async () => {
  const response = await api.post('/next');
  return response.data;
};

export const seekTo = async (position: number) => {
  const response = await api.post(`/seek/${position}`);
  return response.data;
};

// Status
export const getStatus = async (): Promise<PlayerStatus> => {
  const response = await api.get('/status');
  return response.data;
};

export const getPosition = async () => {
  const response = await api.get('/position');
  return response.data;
};

// Queue
export const addToQueue = async (trackId: string) => {
  const response = await api.post(`/queue/add/${trackId}`);
  return response.data;
};

// Volume
export const setVolume = async (level: number) => {
  const response = await api.post(`/volume/${level}`);
  return response.data;
};

// Shuffle & Repeat
export const toggleShuffle = async () => {
  const response = await api.post('/shuffle/toggle');
  return response.data;
};

export const cycleRepeat = async () => {
  const response = await api.post('/repeat/cycle');
  return response.data;
};

// Favorites
export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data.favorites;
};

export const addFavorite = async (trackId: string) => {
  const response = await api.post(`/favorites/${trackId}`);
  return response.data;
};

export const removeFavorite = async (trackId: string) => {
  const response = await api.delete(`/favorites/${trackId}`);
  return response.data;
};

export default api;