'use client'

import { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import TrackGrid from '@/components/TrackGrid'
import { searchTracks } from '@/lib/api'
import type { Track } from '@/types'

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const results = await searchTracks(query)
      setTracks(results)
    } catch (err) {
      setError('Failed to search tracks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Search Music</h1>
      
      <SearchBar onSearch={handleSearch} />

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-spotify-green"></div>
        </div>
      ) : tracks.length > 0 ? (
        <TrackGrid tracks={tracks} />
      ) : (
        <div className="text-center text-spotify-lightgray mt-20">
          <p className="text-xl">Search for your favorite music</p>
          <p className="mt-2">Spotify metadata + YouTube streaming</p>
        </div>
      )}
    </div>
  )
}