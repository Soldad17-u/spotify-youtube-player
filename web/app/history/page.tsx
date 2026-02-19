'use client'

import { useState, useEffect } from 'react'
import { getRecentTracks, getMostPlayed } from '@/lib/api'
import TrackGrid from '@/components/TrackGrid'
import type { Track } from '@/types'

export default function HistoryPage() {
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [mostPlayed, setMostPlayed] = useState<Track[]>([])
  const [activeTab, setActiveTab] = useState<'recent' | 'most-played'>('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const [recent, popular] = await Promise.all([
        getRecentTracks(),
        getMostPlayed(),
      ])
      setRecentTracks(recent)
      setMostPlayed(popular)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-spotify-green"></div>
      </div>
    )
  }

  const tracks = activeTab === 'recent' ? recentTracks : mostPlayed

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">🕐 Listening History</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-spotify-green text-white'
              : 'bg-spotify-gray text-spotify-lightgray hover:text-white'
          }`}
        >
          Recently Played
        </button>
        <button
          onClick={() => setActiveTab('most-played')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'most-played'
              ? 'bg-spotify-green text-white'
              : 'bg-spotify-gray text-spotify-lightgray hover:text-white'
          }`}
        >
          Most Played
        </button>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center text-spotify-lightgray mt-20">
          <p className="text-xl">No history yet</p>
          <p className="mt-2">Start listening to build your history!</p>
        </div>
      ) : (
        <TrackGrid tracks={tracks} />
      )}
    </div>
  )
}