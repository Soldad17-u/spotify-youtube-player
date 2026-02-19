// API client for web app

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_art: string;
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
  has_previous: boolean;
}

export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
  preset: string;
}

export const api = {
  // Search
  async search(query: string, limit = 20) {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return res.json();
  },

  // Playback
  async play(trackId: string) {
    const res = await fetch(`${API_URL}/play/${trackId}`, { method: 'POST' });
    return res.json();
  },

  async pause() {
    const res = await fetch(`${API_URL}/pause`, { method: 'POST' });
    return res.json();
  },

  async resume() {
    const res = await fetch(`${API_URL}/resume`, { method: 'POST' });
    return res.json();
  },

  async previous() {
    const res = await fetch(`${API_URL}/previous`, { method: 'POST' });
    return res.json();
  },

  async next() {
    const res = await fetch(`${API_URL}/next`, { method: 'POST' });
    return res.json();
  },

  async seek(position: number) {
    const res = await fetch(`${API_URL}/seek/${position}`, { method: 'POST' });
    return res.json();
  },

  // Status
  async getStatus(): Promise<PlayerStatus> {
    const res = await fetch(`${API_URL}/status`);
    return res.json();
  },

  async getPosition() {
    const res = await fetch(`${API_URL}/position`);
    return res.json();
  },

  // Volume
  async setVolume(level: number) {
    const res = await fetch(`${API_URL}/volume/${level}`, { method: 'POST' });
    return res.json();
  },

  // Queue
  async addToQueue(trackId: string) {
    const res = await fetch(`${API_URL}/queue/add/${trackId}`, { method: 'POST' });
    return res.json();
  },

  async getQueue() {
    const res = await fetch(`${API_URL}/queue`);
    return res.json();
  },

  async clearQueue() {
    const res = await fetch(`${API_URL}/queue/clear`, { method: 'POST' });
    return res.json();
  },

  // Shuffle/Repeat
  async toggleShuffle() {
    const res = await fetch(`${API_URL}/shuffle/toggle`, { method: 'POST' });
    return res.json();
  },

  async cycleRepeat() {
    const res = await fetch(`${API_URL}/repeat/cycle`, { method: 'POST' });
    return res.json();
  },

  // Equalizer
  async getEqualizer(): Promise<EQSettings> {
    const res = await fetch(`${API_URL}/equalizer`);
    return res.json();
  },

  async setEQBand(band: 'bass' | 'mid' | 'treble', value: number) {
    const res = await fetch(`${API_URL}/equalizer/${band}/${value}`, { method: 'POST' });
    return res.json();
  },

  async applyEQPreset(preset: string) {
    const res = await fetch(`${API_URL}/equalizer/preset/${preset}`, { method: 'POST' });
    return res.json();
  },

  // Favorites
  async getFavorites() {
    const res = await fetch(`${API_URL}/favorites`);
    return res.json();
  },

  async addFavorite(trackId: string) {
    const res = await fetch(`${API_URL}/favorites/${trackId}`, { method: 'POST' });
    return res.json();
  },

  async removeFavorite(trackId: string) {
    const res = await fetch(`${API_URL}/favorites/${trackId}`, { method: 'DELETE' });
    return res.json();
  },

  // History
  async getHistory(limit = 50) {
    const res = await fetch(`${API_URL}/history?limit=${limit}`);
    return res.json();
  },

  // Statistics
  async getStatistics() {
    const res = await fetch(`${API_URL}/statistics`);
    return res.json();
  },
};
