'use client'

import { useState, FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists, or albums..."
          className="w-full px-6 py-4 bg-spotify-gray text-white rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green placeholder-spotify-lightgray"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-spotify-green hover:bg-spotify-green/80 text-white px-6 py-2 rounded-full font-medium transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar