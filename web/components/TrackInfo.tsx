'use client';

import Image from 'next/image';
import type { Track } from '@/lib/api';

interface TrackInfoProps {
  track: Track | null;
}

export default function TrackInfo({ track }: TrackInfoProps) {
  if (!track) {
    return (
      <div className="text-center">
        <div className="w-64 h-64 bg-spotify-light-gray rounded-lg mb-6 flex items-center justify-center">
          <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-spotify-text-gray">No track playing</h2>
        <p className="text-spotify-text-gray mt-2">Search for music to get started</p>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md">
      <div className="relative w-64 h-64 mx-auto mb-6">
        {track.album_art ? (
          <Image
            src={track.album_art}
            alt={track.album}
            fill
            className="rounded-lg shadow-2xl object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-spotify-light-gray rounded-lg flex items-center justify-center">
            <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-2 truncate">{track.name}</h1>
      <p className="text-xl text-spotify-text-gray truncate">{track.artist}</p>
      <p className="text-sm text-spotify-text-gray mt-1 truncate">{track.album}</p>
    </div>
  );
}