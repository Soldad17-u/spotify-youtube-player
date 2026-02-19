'use client';

import { useState } from 'react';
import { debounce } from '@/lib/utils';

interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
}

export default function VolumeControl({ volume, onChange }: VolumeControlProps) {
  const [localVolume, setLocalVolume] = useState(volume);

  const debouncedChange = debounce((vol: number) => {
    onChange(vol);
  }, 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setLocalVolume(newVolume);
    debouncedChange(newVolume);
  };

  return (
    <div className="flex items-center gap-2 w-32">
      <svg className="w-5 h-5 text-spotify-text-gray" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
      </svg>
      <input
        type="range"
        min={0}
        max={100}
        value={localVolume}
        onChange={handleChange}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${localVolume}%, #4d4d4d ${localVolume}%, #4d4d4d 100%)`,
        }}
      />
    </div>
  );
}