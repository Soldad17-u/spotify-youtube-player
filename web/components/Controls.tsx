'use client';

interface ControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: string;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
}

export default function Controls({
  isPlaying,
  shuffle,
  repeat,
  onPlay,
  onPause,
  onNext,
  onShuffle,
  onRepeat,
}: ControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Shuffle */}
      <button
        onClick={onShuffle}
        className={`p-2 rounded-full transition ${shuffle ? 'text-spotify-green' : 'text-spotify-text-gray hover:text-white'}`}
        title="Shuffle"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
        </svg>
      </button>

      {/* Previous - Disabled for now */}
      <button
        className="p-2 text-spotify-text-gray cursor-not-allowed"
        disabled
        title="Previous (coming soon)"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-4 bg-white text-black rounded-full hover:scale-105 transition shadow-lg"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        className="p-2 text-white hover:scale-105 transition"
        title="Next"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      {/* Repeat */}
      <button
        onClick={onRepeat}
        className={`p-2 rounded-full transition ${
          repeat !== 'off' ? 'text-spotify-green' : 'text-spotify-text-gray hover:text-white'
        }`}
        title={`Repeat: ${repeat}`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </svg>
        {repeat === 'one' && (
          <span className="absolute text-xs font-bold">1</span>
        )}
      </button>
    </div>
  );
}