'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';

interface Statistics {
  total_plays: number;
  unique_tracks: number;
  total_time_seconds: number;
  top_tracks: Array<{
    track_name: string;
    artist_name: string;
    play_count: number;
    album_art?: string;
  }>;
  top_artists: Array<{
    artist_name: string;
    play_count: number;
  }>;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await api.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">No statistics available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">📊 Statistics</h1>
        <p className="text-gray-400 mb-8">Your listening insights</p>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/40 rounded-xl p-6">
            <div className="text-green-400 text-sm font-medium mb-2">🎵 Total Plays</div>
            <div className="text-4xl font-bold text-white">{stats.total_plays.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/40 rounded-xl p-6">
            <div className="text-blue-400 text-sm font-medium mb-2">⏱️ Listening Time</div>
            <div className="text-4xl font-bold text-white">
              {formatTime(stats.total_time_seconds)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/40 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-medium mb-2">🎼 Unique Tracks</div>
            <div className="text-4xl font-bold text-white">{stats.unique_tracks}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Tracks */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">🏆 Top Tracks</h2>
            <div className="space-y-4">
              {stats.top_tracks.slice(0, 10).map((track, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-600 w-8">
                    #{index + 1}
                  </div>
                  
                  {track.album_art ? (
                    <Image
                      src={track.album_art}
                      alt={track.track_name}
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xl">🎵</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{track.track_name}</div>
                    <div className="text-gray-400 text-sm truncate">{track.artist_name}</div>
                  </div>

                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    {track.play_count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artists */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">🎤 Top Artists</h2>
            <div className="space-y-4">
              {stats.top_artists.slice(0, 10).map((artist, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-600 w-8">
                    #{index + 1}
                  </div>

                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    {artist.artist_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 text-white font-medium">
                    {artist.artist_name}
                  </div>

                  <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                    {artist.play_count} {artist.play_count === 1 ? 'play' : 'plays'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-red-900/30 border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">✨ Fun Facts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              🎶 You've listened to <strong className="text-white">{stats.unique_tracks}</strong> different songs
            </div>
            <div>
              🔥 Your most played track has <strong className="text-white">{stats.top_tracks[0]?.play_count || 0}</strong> plays
            </div>
            <div>
              🎵 Average of <strong className="text-white">{(stats.total_plays / stats.unique_tracks).toFixed(1)}</strong> plays per track
            </div>
            <div>
              ⏱️ You've spent <strong className="text-white">{formatTime(stats.total_time_seconds)}</strong> listening to music
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
