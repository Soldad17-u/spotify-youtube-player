'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const links = [
    { href: '/', label: 'Search', icon: '🔍' },
    { href: '/playlists', label: 'Playlists', icon: '📋' },
    { href: '/favorites', label: 'Favorites', icon: '❤️' },
    { href: '/history', label: 'History', icon: '🕐' },
    { href: '/statistics', label: 'Statistics', icon: '📊' },
  ]

  return (
    <aside className="w-64 bg-spotify-black border-r border-spotify-gray p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-spotify-green">🎵 Spotify YT</h1>
        <p className="text-xs text-spotify-lightgray mt-1">Hybrid Player</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-spotify-gray text-white'
                    : 'text-spotify-lightgray hover:text-white hover:bg-spotify-gray/50'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-spotify-gray">
        <div className="text-xs text-spotify-lightgray">
          <p>Backend: ✅ Connected</p>
          <p className="mt-1">Version 3.2.0</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar