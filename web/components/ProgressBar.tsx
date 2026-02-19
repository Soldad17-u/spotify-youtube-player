'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/utils';

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
}

export default function ProgressBar({ position, duration, onSeek }: ProgressBarProps) {
  const [dragging, setDragging] = useState(false);
  const [tempPosition, setTempPosition] = useState(position);

  useEffect(() => {
    if (!dragging) {
      setTempPosition(position);
    }
  }, [position, dragging]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = Number(e.target.value);
    setTempPosition(newPosition);
  };

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
    onSeek(tempPosition);
  };

  const percentage = duration > 0 ? (tempPosition / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="range"
          min={0}
          max={duration}
          value={tempPosition}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${percentage}%, #4d4d4d ${percentage}%, #4d4d4d 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-spotify-text-gray">
        <span>{formatTime(tempPosition)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}