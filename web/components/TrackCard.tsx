'use client'

import { useState } from 'react'
import Image from 'next/image'
import { playTrack, addToQueue, addFavorite, removeFavorite } from '@/lib/api'
import type { Track } from '@/types'

interface TrackCardProps {
  track: Track
}

const TrackCard = ({ track }: TrackCardProps) => {
  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const albumArt = track.album.images[0]?.url || '/placeholder.png'
  const artistNames = track.artists.map((a) => a.name).join(', ')
  const durationMin = Math.floor(track.duration_ms / 60000)
  const durationSec = Math.floor((track.duration_ms % 60000) / 1000)

  const handlePlay = async () => {
    setLoading(true)
    try {
      await playTrack(track.id)
    } catch (err) {
      console.error('Failed to play:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToQueue = async () => {
    try {
      await addToQueue(track.id)
    } catch (err) {
      console.error('Failed to add to queue:', err)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(track.id)
        setIsFavorite(false)
      } else {
        await addFavorite(track.id)
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  return (
    <div className="bg-spotify-gray p-4 rounded-lg hover:bg-spotify-gray/70 transition-all group cursor-pointer">
      <div className="relative aspect-square mb-4">
        <Image
          src={albumArt}
          alt={track.name}
          fill
          className="object-cover rounded-md"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handlePlay}
            disabled={loading}
            className="bg-spotify-green hover:bg-spotify-green/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110 disabled:opacity-50"
          >
            {loading ? '⏳' : '▶️'}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-white truncate" title={track.name}>
          {track.name}
        </h3>
        <p className="text-sm text-spotify-lightgray truncate" title={artistNames}>
          {artistNames}
        </p>
        <p className="text-xs text-spotify-lightgray">
          {durationMin}:{durationSec.toString().padStart(2, '0')}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleToggleFavorite}
          className="text-xl hover:scale-110 transition-transform"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        <button
          onClick={handleAddToQueue}
          className="text-xl hover:scale-110 transition-transform"
          title="Add to queue"
        >
          ➕
        </button>
      </div>
    </div>
  )
}

export default TrackCard