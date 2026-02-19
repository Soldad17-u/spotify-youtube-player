'use client'

import { useState, useEffect } from 'react'
import { getFavorites } from '@/lib/api'
import TrackGrid from '@/components/TrackGrid'
import type { Track } from '@/types'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const data = await getFavorites()
      setFavorites(data)
    } catch (err) {
      console.error('Failed to load favorites:', err)
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

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">❤️ Your Favorites</h1>

      {favorites.length === 0 ? (
        <div className="text-center text-spotify-lightgray mt-20">
          <p className="text-xl">No favorites yet</p>
          <p className="mt-2">Start adding tracks you love!</p>
        </div>
      ) : (
        <>
          <p className="text-spotify-lightgray mb-6">{favorites.length} tracks</p>
          <TrackGrid tracks={favorites} />
        </>
      )}
    </div>
  )
}