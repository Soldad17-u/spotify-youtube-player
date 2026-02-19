import axios from 'axios'
import type { Track, Playlist, QueueItem } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Search
export const searchTracks = async (query: string): Promise<Track[]> => {
  const response = await api.get('/search', { params: { q: query, limit: 20 } })
  return response.data.tracks
}

// Playback
export const playTrack = async (trackId: string) => {
  const response = await api.post(`/play/${trackId}`)
  return response.data
}

export const pausePlayback = async () => {
  const response = await api.post('/pause')
  return response.data
}

export const resumePlayback = async () => {
  const response = await api.post('/resume')
  return response.data
}

export const playNext = async () => {
  const response = await api.post('/next')
  return response.data
}

export const seekTo = async (position: number) => {
  const response = await api.post(`/seek/${position}`)
  return response.data
}

// Queue
export const addToQueue = async (trackId: string) => {
  const response = await api.post(`/queue/add/${trackId}`)
  return response.data
}

export const getQueue = async (): Promise<QueueItem[]> => {
  const response = await api.get('/queue')
  return response.data.queue
}

export const clearQueue = async () => {
  const response = await api.post('/queue/clear')
  return response.data
}

// Status
export const getStatus = async () => {
  const response = await api.get('/status')
  return response.data
}

export const getPosition = async () => {
  const response = await api.get('/position')
  return response.data
}

// Volume
export const setVolume = async (level: number) => {
  const response = await api.post(`/volume/${level}`)
  return response.data
}

export const getVolume = async () => {
  const response = await api.get('/volume')
  return response.data
}

// Shuffle & Repeat
export const toggleShuffle = async () => {
  const response = await api.post('/shuffle/toggle')
  return response.data
}

export const cycleRepeat = async () => {
  const response = await api.post('/repeat/cycle')
  return response.data
}

// Playlists
export const getPlaylists = async (): Promise<Playlist[]> => {
  const response = await api.get('/playlists')
  return response.data.playlists
}

export const getPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
  const response = await api.get(`/playlist/${playlistId}`)
  return response.data.tracks
}

// Equalizer
export const getEqualizer = async () => {
  const response = await api.get('/equalizer')
  return response.data
}

export const setEqualizerBand = async (band: string, value: number) => {
  const response = await api.post(`/equalizer/band/${band}/${value}`)
  return response.data
}

export const loadEqualizerPreset = async (preset: string) => {
  const response = await api.post(`/equalizer/preset/${preset}`)
  return response.data
}

// Favorites
export const getFavorites = async () => {
  const response = await api.get('/favorites')
  return response.data.favorites
}

export const addFavorite = async (trackId: string) => {
  const response = await api.post(`/favorites/${trackId}`)
  return response.data
}

export const removeFavorite = async (trackId: string) => {
  const response = await api.delete(`/favorites/${trackId}`)
  return response.data
}

export const checkFavorite = async (trackId: string) => {
  const response = await api.get(`/favorites/check/${trackId}`)
  return response.data.is_favorite
}

// History
export const getRecentTracks = async () => {
  const response = await api.get('/history/recent')
  return response.data.tracks
}

export const getMostPlayed = async () => {
  const response = await api.get('/history/most-played')
  return response.data.tracks
}

// Statistics
export const getStatistics = async () => {
  const response = await api.get('/statistics')
  return response.data
}

// Lyrics
export const getLyrics = async (trackId: string) => {
  const response = await api.get(`/lyrics/${trackId}`)
  return response.data
}

export default api