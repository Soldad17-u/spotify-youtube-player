'use client'

import TrackCard from './TrackCard'
import type { Track } from '@/types'

interface TrackGridProps {
  tracks: Track[]
}

const TrackGrid = ({ tracks }: TrackGridProps) => {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </div>
  )
}

export default TrackGrid