'use client'

import { useState, useEffect } from 'react'
import { getPlaylists, getPlaylistTracks } from '@/lib/api'
import type { Playlist, Track } from '@/types'
import TrackGrid from '@/components/TrackGrid'
import Image from 'next/image'

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlaylists()
  }, [])

  const loadPlaylists = async () => {
    try {
      const data = await getPlaylists()
      setPlaylists(data)
    } catch (err) {
      console.error('Failed to load playlists:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlaylist = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    setLoading(true)
    try {
      const data = await getPlaylistTracks(playlist.id)
      setTracks(data)
    } catch (err) {
      console.error('Failed to load tracks:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && playlists.length === 0) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-spotify-green"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Your Playlists</h1>

      {!selectedPlaylist ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handleSelectPlaylist(playlist)}
              className="bg-spotify-gray p-4 rounded-lg hover:bg-spotify-gray/70 transition-all cursor-pointer"
            >
              {playlist.images[0] && (
                <div className="relative aspect-square mb-4">
                  <Image
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
              <p className="text-sm text-spotify-lightgray mt-1">
                {playlist.tracks.total} tracks
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="mb-6 text-spotify-lightgray hover:text-white flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to playlists</span>
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold">{selectedPlaylist.name}</h2>
            <p className="text-spotify-lightgray mt-2">{tracks.length} tracks</p>
          </div>

          {loading ? (
            <div className="flex justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
            </div>
          ) : (
            <TrackGrid tracks={tracks} />
          )}
        </div>
      )}
    </div>
  )
}