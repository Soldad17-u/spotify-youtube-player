export interface Track {
  id: string;
  name: string;
  artist: string;
  artists?: { name: string }[];
  album: string;
  album_art: string | null;
  duration: number;
  duration_ms?: number;
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