'use client';

import TrackItem from './TrackItem';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
}

interface TrackListProps {
  tracks: Track[];
  onPlayTrack: (trackId: string) => void;
  onAddToQueue: (trackId: string) => void;
  loading?: boolean;
}

export default function TrackList({ tracks, onPlayTrack, onAddToQueue, loading }: TrackListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-spotify-text-gray">
        <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <p className="text-lg">No tracks found</p>
        <p className="text-sm mt-2">Try searching for something else</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <TrackItem
          key={track.id}
          track={track}
          onPlay={() => onPlayTrack(track.id)}
          onAddToQueue={() => onAddToQueue(track.id)}
        />
      ))}
    </div>
  );
}