export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
}

export interface Artist {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  name: string;
  images: Image[];
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface PlayerStatus {
  is_playing: boolean;
  current_track: CurrentTrack | null;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: string;
}

export interface CurrentTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_art: string;
  duration: number;
}