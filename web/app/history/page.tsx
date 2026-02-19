'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';

interface HistoryTrack {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  play_count: number;
  last_played: string;
  album_art?: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getHistory(100);
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (trackId: string) => {
    try {
      await api.play(trackId);
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const filteredHistory = history.filter((track) =>
    track.track_name.toLowerCase().includes(search.toLowerCase()) ||
    track.artist_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">📜 Listening History</h1>
        <p className="text-gray-400 mb-8">Your recently played tracks</p>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search your history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-4">
            <div className="text-green-400 text-sm font-medium">Total Tracks</div>
            <div className="text-3xl font-bold text-white mt-1">{history.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
            <div className="text-blue-400 text-sm font-medium">Total Plays</div>
            <div className="text-3xl font-bold text-white mt-1">
              {history.reduce((sum, t) => sum + t.play_count, 0)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 text-sm font-medium">Unique Artists</div>
            <div className="text-3xl font-bold text-white mt-1">
              {new Set(history.map(t => t.artist_name)).size}
            </div>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl text-gray-400">
              {search ? 'No tracks found' : 'No history yet'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((track, index) => (
              <div
                key={`${track.track_id}-${index}`}
                className="group bg-gray-800/50 hover:bg-gray-800 backdrop-blur rounded-lg p-4 transition-all flex items-center gap-4"
              >
                {/* Album Art */}
                {track.album_art ? (
                  <Image
                    src={track.album_art}
                    alt={track.album_name}
                    width={56}
                    height={56}
                    className="rounded"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{track.track_name}</h3>
                  <p className="text-gray-400 text-sm truncate">{track.artist_name}</p>
                </div>

                {/* Play Count */}
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  {track.play_count} {track.play_count === 1 ? 'play' : 'plays'}
                </div>

                {/* Last Played */}
                <div className="text-gray-500 text-sm w-24 text-right">
                  {formatDate(track.last_played)}
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handlePlay(track.track_id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center"
                  title="Play again"
                >
                  ▶️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
