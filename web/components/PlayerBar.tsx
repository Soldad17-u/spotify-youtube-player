'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  pausePlayback,
  resumePlayback,
  playNext,
  seekTo,
  setVolume as setVolumeAPI,
  toggleShuffle,
  cycleRepeat,
  getStatus,
  getPosition,
} from '@/lib/api'
import type { PlayerStatus } from '@/types'

const PlayerBar = () => {
  const [status, setStatus] = useState<PlayerStatus | null>(null)
  const [position, setPosition] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isDragging, setIsDragging] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Poll status every second
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getStatus()
        setStatus(data)
      } catch (err) {
        console.error('Failed to get status:', err)
      }
    }

    const fetchPosition = async () => {
      if (!isDragging) {
        try {
          const data = await getPosition()
          setPosition(data.position || 0)
        } catch (err) {
          console.error('Failed to get position:', err)
        }
      }
    }

    // Initial fetch
    fetchStatus()
    fetchPosition()

    // Poll
    const statusInterval = setInterval(fetchStatus, 1000)
    const positionInterval = setInterval(fetchPosition, 500)

    return () => {
      clearInterval(statusInterval)
      clearInterval(positionInterval)
    }
  }, [isDragging])

  const handlePlayPause = async () => {
    try {
      if (status?.is_playing) {
        await pausePlayback()
      } else {
        await resumePlayback()
      }
    } catch (err) {
      console.error('Failed to toggle playback:', err)
    }
  }

  const handleNext = async () => {
    try {
      await playNext()
    } catch (err) {
      console.error('Failed to play next:', err)
    }
  }

  const handleShuffle = async () => {
    try {
      await toggleShuffle()
    } catch (err) {
      console.error('Failed to toggle shuffle:', err)
    }
  }

  const handleRepeat = async () => {
    try {
      await cycleRepeat()
    } catch (err) {
      console.error('Failed to cycle repeat:', err)
    }
  }

  const handleProgressClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !status?.duration) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newPosition = Math.floor(percentage * status.duration)

    try {
      await seekTo(newPosition)
      setPosition(newPosition)
    } catch (err) {
      console.error('Failed to seek:', err)
    }
  }

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)

    try {
      await setVolumeAPI(newVolume)
    } catch (err) {
      console.error('Failed to set volume:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = status?.duration ? (position / status.duration) * 100 : 0

  if (!status?.current_track) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-spotify-gray border-t border-spotify-gray h-20 flex items-center justify-center text-spotify-lightgray">
        <p>No track playing</p>
      </div>
    )
  }

  const { current_track } = status

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-gray border-t border-spotify-dark h-24 px-4 flex items-center justify-between">
      {/* Left: Track Info */}
      <div className="flex items-center space-x-4 w-1/4">
        {current_track.album_art && (
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image
              src={current_track.album_art}
              alt={current_track.name}
              fill
              className="object-cover rounded"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{current_track.name}</p>
          <p className="text-sm text-spotify-lightgray truncate">{current_track.artist}</p>
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center w-2/4">
        <div className="flex items-center space-x-4 mb-2">
          {/* Shuffle */}
          <button
            onClick={handleShuffle}
            className={`hover:text-white transition-colors ${
              status.shuffle ? 'text-spotify-green' : 'text-spotify-lightgray'
            }`}
            title="Shuffle"
          >
            🔀
          </button>

          {/* Previous (disabled for now) */}
          <button
            className="text-spotify-lightgray hover:text-white transition-colors opacity-50 cursor-not-allowed"
            disabled
            title="Previous"
          >
            ⏮️
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="bg-white text-black hover:scale-105 transition-transform w-10 h-10 rounded-full flex items-center justify-center"
            title={status.is_playing ? 'Pause' : 'Play'}
          >
            {status.is_playing ? '⏸️' : '▶️'}
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            className="text-spotify-lightgray hover:text-white transition-colors"
            title="Next"
          >
            ⏭️
          </button>

          {/* Repeat */}
          <button
            onClick={handleRepeat}
            className={`hover:text-white transition-colors ${
              status.repeat !== 'off' ? 'text-spotify-green' : 'text-spotify-lightgray'
            }`}
            title={`Repeat: ${status.repeat}`}
          >
            {status.repeat === 'one' ? '🔂' : '🔁'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center space-x-2">
          <span className="text-xs text-spotify-lightgray w-10 text-right">
            {formatTime(position)}
          </span>
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            className="flex-1 h-1 bg-spotify-dark rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-spotify-green rounded-full relative group-hover:bg-spotify-green/80 transition-colors"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-spotify-lightgray w-10">
            {formatTime(status.duration || 0)}
          </span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="flex items-center justify-end space-x-3 w-1/4">
        <span className="text-spotify-lightgray" title="Volume">
          🔊
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-spotify-dark rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${volume}%, #3e3e3e ${volume}%, #3e3e3e 100%)`
          }}
        />
        <span className="text-xs text-spotify-lightgray w-8">{volume}%</span>
      </div>
    </div>
  )
}

export default PlayerBar