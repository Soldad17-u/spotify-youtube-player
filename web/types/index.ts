export interface Track {
  id: string
  name: string
  artists: Artist[]
  album: Album
  duration_ms: number
  preview_url?: string
}

export interface Artist {
  id: string
  name: string
}

export interface Album {
  id: string
  name: string
  images: Image[]
}

export interface Image {
  url: string
  height: number
  width: number
}

export interface Playlist {
  id: string
  name: string
  description: string
  images: Image[]
  tracks: {
    total: number
  }
}

export interface QueueItem {
  id: string
  name: string
  artist: string
  album: string
  album_art: string
  duration: number
  file_path: string
}

export interface PlayerStatus {
  is_playing: boolean
  current_track: QueueItem | null
  position: number
  duration: number
  volume: number
  shuffle: boolean
  repeat: string
  queue_length: number
}