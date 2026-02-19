'use client';

import { useState } from 'react';
import Player from '@/components/Player';
import SearchBar from '@/components/SearchBar';
import TrackList from '@/components/TrackList';
import { playerAPI } from '@/lib/api';

export default function Home() {
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const response = await playerAPI.search(query);
      setSearchResults(response.data.tracks || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePlayTrack = async (trackId: string) => {
    try {
      await playerAPI.play(trackId);
    } catch (error) {
      console.error('Play error:', error);
      alert('Failed to play track. Make sure backend is running!');
    }
  };

  const handleAddToQueue = async (trackId: string) => {
    try {
      await playerAPI.addToQueue(trackId);
      alert('✅ Added to queue!');
    } catch (error) {
      console.error('Queue error:', error);
      alert('Failed to add to queue');
    }
  };

  return (
    <div className="flex h-screen bg-spotify-black text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-black transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-spotify-green mb-6">SY Player</h1>
          
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-spotify-text-gray hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Home
            </a>
            <a href="#" className="flex items-center gap-3 text-spotify-text-gray hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              Search
            </a>
            <a href="#" className="flex items-center gap-3 text-spotify-text-gray hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Favorites
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-spotify-gray p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-spotify-light-gray rounded transition md:hidden"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          <div className="flex-1 max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchResults.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Search Results</h2>
              <TrackList
                tracks={searchResults}
                onPlayTrack={handlePlayTrack}
                onAddToQueue={handleAddToQueue}
                loading={searching}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-spotify-text-gray">
              <svg className="w-24 h-24 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Search for music</h2>
              <p>Find your favorite songs and start playing</p>
            </div>
          )}
        </div>

        {/* Player Bar */}
        <div className="h-32 border-t border-gray-800">
          <Player />
        </div>
      </main>
    </div>
  );
}