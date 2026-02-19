'use client';

import Image from 'next/image';
import { formatTime } from '@/lib/utils';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
}

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
  onAddToQueue: () => void;
}

export default function TrackItem({ track, onPlay, onAddToQueue }: TrackItemProps) {
  const albumArt = track.album.images[0]?.url;
  const artist = track.artists[0]?.name || 'Unknown Artist';
  const duration = formatTime(track.duration_ms / 1000);

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-spotify-light-gray transition group">
      {/* Album Art */}
      <div className="relative w-12 h-12 flex-shrink-0">
        {albumArt ? (
          <Image
            src={albumArt}
            alt={track.album.name}
            fill
            className="rounded object-cover"
          />
        ) : (
          <div className="w-full h-full bg-spotify-light-gray rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{track.name}</h4>
        <p className="text-sm text-spotify-text-gray truncate">{artist}</p>
      </div>

      {/* Duration */}
      <div className="text-sm text-spotify-text-gray">
        {duration}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onPlay}
          className="p-2 hover:bg-spotify-green rounded-full transition"
          title="Play now"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          onClick={onAddToQueue}
          className="p-2 hover:bg-spotify-light-gray rounded-full transition"
          title="Add to queue"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}