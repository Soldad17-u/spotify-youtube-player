'use client';

import { useEffect, useState } from 'react';
import { playerAPI, type PlayerStatus } from '@/lib/api';
import TrackInfo from './TrackInfo';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';

export default function Player() {
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await playerAPI.getStatus();
      setStatus(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to player backend');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = async () => {
    try {
      await playerAPI.resume();
      await fetchStatus();
    } catch (err) {
      console.error('Play error:', err);
    }
  };

  const handlePause = async () => {
    try {
      await playerAPI.pause();
      await fetchStatus();
    } catch (err) {
      console.error('Pause error:', err);
    }
  };

  const handleNext = async () => {
    try {
      await playerAPI.next();
      await fetchStatus();
    } catch (err) {
      console.error('Next error:', err);
    }
  };

  const handleSeek = async (position: number) => {
    try {
      await playerAPI.seek(position);
    } catch (err) {
      console.error('Seek error:', err);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    try {
      await playerAPI.setVolume(volume);
    } catch (err) {
      console.error('Volume error:', err);
    }
  };

  const handleShuffle = async () => {
    try {
      await playerAPI.toggleShuffle();
      await fetchStatus();
    } catch (err) {
      console.error('Shuffle error:', err);
    }
  };

  const handleRepeat = async () => {
    try {
      await playerAPI.cycleRepeat();
      await fetchStatus();
    } catch (err) {
      console.error('Repeat error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-red-500 text-xl">⚠️ {error}</div>
        <button
          onClick={fetchStatus}
          className="px-6 py-3 bg-spotify-green text-white rounded-full hover:bg-spotify-green-light transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-8">
        <TrackInfo track={status?.current_track || null} />
      </div>

      <div className="bg-spotify-light-gray border-t border-gray-800 p-6">
        <ProgressBar
          position={status?.position || 0}
          duration={status?.duration || 0}
          onSeek={handleSeek}
        />

        <div className="flex items-center justify-between mt-6">
          <VolumeControl
            volume={status?.volume || 50}
            onChange={handleVolumeChange}
          />

          <Controls
            isPlaying={status?.is_playing || false}
            shuffle={status?.shuffle || false}
            repeat={status?.repeat || 'off'}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNext}
            onShuffle={handleShuffle}
            onRepeat={handleRepeat}
          />

          <div className="w-32 text-right text-sm text-spotify-text-gray">
            Queue: {status?.queue_length || 0}
          </div>
        </div>
      </div>
    </div>
  );
}