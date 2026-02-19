'use client'

import { useState, useEffect } from 'react'
import { getStatistics } from '@/lib/api'

interface Statistics {
  total_tracks_played: number
  total_play_time_hours: number
  unique_tracks_played: number
  total_favorites: number
  most_played_track?: {
    name: string
    artist: string
    play_count: number
  }
  listening_streak_days?: number
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStatistics()
      setStats(data)
    } catch (err) {
      console.error('Failed to load statistics:', err)
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

  if (!stats) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">📊 Statistics</h1>
        <p className="text-spotify-lightgray">Failed to load statistics</p>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Tracks Played',
      value: stats.total_tracks_played.toLocaleString(),
      icon: '🎵',
    },
    {
      label: 'Total Play Time',
      value: `${stats.total_play_time_hours.toFixed(1)} hours`,
      icon: '⏱️',
    },
    {
      label: 'Unique Tracks',
      value: stats.unique_tracks_played.toLocaleString(),
      icon: '🎼',
    },
    {
      label: 'Favorite Tracks',
      value: stats.total_favorites.toLocaleString(),
      icon: '❤️',
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">📊 Your Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-spotify-gray p-6 rounded-lg hover:bg-spotify-gray/70 transition-colors"
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <div className="text-3xl font-bold text-white mb-2">{card.value}</div>
            <div className="text-spotify-lightgray">{card.label}</div>
          </div>
        ))}
      </div>

      {stats.most_played_track && (
        <div className="bg-gradient-to-r from-spotify-green/20 to-spotify-gray p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🏆 Most Played Track</h2>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-white">
              {stats.most_played_track.name}
            </p>
            <p className="text-spotify-lightgray">{stats.most_played_track.artist}</p>
            <p className="text-spotify-green font-medium mt-2">
              {stats.most_played_track.play_count} plays
            </p>
          </div>
        </div>
      )}

      {stats.listening_streak_days !== undefined && stats.listening_streak_days > 0 && (
        <div className="bg-spotify-gray p-6 rounded-lg mt-6">
          <h2 className="text-2xl font-bold mb-2">🔥 Listening Streak</h2>
          <p className="text-4xl font-bold text-spotify-green">
            {stats.listening_streak_days} days
          </p>
          <p className="text-spotify-lightgray mt-2">Keep it going!</p>
        </div>
      )}
    </div>
  )
}