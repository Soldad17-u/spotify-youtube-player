# 🎵 Spotify YouTube Hybrid Music Player

> **The ultimate music player combining Spotify's metadata with YouTube's free streaming**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.72-blue.svg)](https://reactnative.dev/)

---

## ✨ Overview

A **full-stack cross-platform music player** that leverages Spotify's extensive music database for metadata while streaming audio from YouTube — completely free!

### 🔑 Key Concept

1. **Search**: Use Spotify's API for track discovery
2. **Match**: Intelligently find corresponding YouTube videos
3. **Stream**: Play high-quality audio from YouTube
4. **Enjoy**: All the features of premium players, $0/month

---

## 🎯 Features (50+)

### 🎶 Core Playback
- [x] Play/Pause/Stop controls
- [x] Next track (auto-play)
- [x] Progress tracking & seeking
- [x] Volume control
- [x] Shuffle mode
- [x] Repeat modes (off/all/one)
- [x] Queue management
- [x] Add to queue
- [x] Clear queue
- [x] View queue

### 🔍 Discovery
- [x] Search Spotify catalog (millions of tracks)
- [x] Browse playlists
- [x] View albums
- [x] Artist information
- [x] Smart YouTube matching
- [x] Duration-based filtering

### 🎹 Audio Enhancement
- [x] 3-band equalizer (Bass/Mid/Treble)
- [x] EQ presets (Rock, Pop, Jazz, Classical, etc.)
- [x] Custom EQ settings
- [x] Real-time audio visualization (FFT)
- [x] 64 frequency bands display
- [x] Peak detection

### 💾 Caching & Performance
- [x] Local audio cache
- [x] Smart cache management
- [x] Cache size monitoring
- [x] Batch playlist download
- [x] Parallel downloads (3 workers)
- [x] Progressive streaming (10% buffer)
- [x] Skip cached tracks
- [x] Background download completion

### 📊 Data & Analytics
- [x] Listening history
- [x] Most played tracks
- [x] Recently played
- [x] Play count statistics
- [x] Total play time
- [x] Unique tracks count
- [x] Listening streaks

### ❤️ Favorites
- [x] Save favorite tracks
- [x] Remove from favorites
- [x] View all favorites
- [x] Check favorite status
- [x] Quick access

### 🎵 Lyrics
- [x] Fetch synchronized lyrics
- [x] Display with playback
- [x] Multiple sources (Genius, etc.)
- [x] Formatted display
- [x] Auto-scroll (planned)

### 🖥️ Desktop (Electron)
- [x] Native Windows/Mac/Linux app
- [x] System tray integration
- [x] Global hotkeys
- [x] Toast notifications
- [x] Mini mode
- [x] Always on top
- [x] Auto-updater

### 🌐 Web (Next.js)
- [x] Responsive design
- [x] PWA support
- [x] Dark theme
- [x] Real-time updates
- [x] Works on any browser
- [x] Mobile-friendly
- [x] Deploy to Vercel/Netlify

### 📱 Mobile (React Native)
- [x] Native iOS/Android app
- [x] Touch-optimized UI
- [x] Bottom tab navigation
- [x] Background audio
- [x] Push notifications (planned)
- [x] Offline mode (planned)

---

## 🏗️ Architecture

```
┌────────────────────────────────────┐
│          Spotify API              │
│       (Metadata Source)            │
└────────────┬───────────────────────┘
             │
             │ REST API
             │
┌────────────┴───────────────────────┐
│                                      │
│      Backend (Python/FastAPI)     │
│                                      │
│  • Music matching (Spotify→YT)    │
│  • Audio caching                   │
│  • Playback control (VLC)          │
│  • Equalizer                       │
│  • User data (SQLite)              │
│  • Playlist management             │
│  • Audio visualizer (FFT)          │
│                                      │
└──────┬─────────────┬─────────────┘
       │              │
       │ HTTP API    │ HTTP API
       │              │
   ┌───┴────┐    ┌───┴────┐
   │          │    │          │
   │ Desktop  │    │   Web     │
   │ Electron │    │ Next.js  │
   │          │    │          │
   └──────────┘    └───┬──────┘
                          │
                          │ Responsive
                          │
                      ┌───┴────┐
                      │          │
                      │  Mobile  │
                      │ React N  │
                      │          │
                      └──────────┘

        ┌───────────────────────────┐
        │    YouTube Streaming     │
        │     (Audio Source)        │
        └───────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Python 3.9+**
- **FastAPI** - Modern web framework
- **Spotipy** - Spotify API wrapper
- **yt-dlp** - YouTube downloader
- **python-vlc** - Audio playback
- **SQLite** - Local database
- **NumPy** - FFT audio analysis

### Desktop
- **Electron** - Cross-platform desktop
- **React** - UI framework
- **Tailwind CSS** - Styling

### Web
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Mobile
- **React Native** - Native apps
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Routing

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- VLC Media Player
- Spotify API credentials
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Soldad17-u/spotify-youtube-player.git
cd spotify-youtube-player
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOL
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
GENIUS_ACCESS_TOKEN=your_genius_token_optional
EOL

# Start server
python main.py
```

Backend runs on `http://localhost:8000`

### 3. Desktop App (Optional)

```bash
cd frontend
npm install
npm start
```

### 4. Web App (Optional)

```bash
cd web
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Web app runs on `http://localhost:3000`

### 5. Mobile App (Optional)

```bash
cd mobile
npm install
npm start

# Scan QR code with Expo Go app
```

---

## 📚 API Documentation

Full API docs available at: `http://localhost:8000/docs` (Swagger UI)

### Key Endpoints

#### Playback
- `POST /play/{track_id}` - Play track
- `POST /pause` - Pause
- `POST /resume` - Resume
- `POST /next` - Next track
- `POST /seek/{position}` - Seek to position
- `GET /status` - Get player status
- `GET /position` - Get current position

#### Search & Metadata
- `GET /search?q={query}` - Search tracks
- `GET /track/{track_id}` - Get track info
- `GET /playlists` - List playlists
- `GET /playlist/{id}` - Get playlist tracks

#### Queue
- `POST /queue/add/{track_id}` - Add to queue
- `GET /queue` - Get queue
- `POST /queue/clear` - Clear queue

#### Equalizer
- `GET /equalizer` - Get EQ settings
- `POST /equalizer/band/{band}/{value}` - Set band
- `POST /equalizer/preset/{preset}` - Load preset
- `POST /equalizer/toggle` - Toggle EQ

#### User Data
- `GET /favorites` - Get favorites
- `POST /favorites/{track_id}` - Add favorite
- `DELETE /favorites/{track_id}` - Remove favorite
- `GET /history` - Get history
- `GET /statistics` - Get stats

#### Advanced
- `POST /playlist/download/{id}` - Batch download
- `GET /visualizer` - Get visualization data
- `GET /lyrics/{track_id}` - Get lyrics

---

## 📸 Screenshots

> Coming soon! Add your screenshots to `/docs/screenshots/`

---

## 📈 Project Stats

- **Lines of Code**: ~15,000
- **Files**: 100+
- **Commits**: 50+
- **Sprints**: 6
- **Development Time**: 2 weeks
- **Platforms**: 3 (Desktop, Web, Mobile)
- **Languages**: 4 (Python, TypeScript, JavaScript, CSS)

---

## 🛣️ Roadmap

### Sprint 1 ✅ - Backend Core
- Basic playback
- Spotify integration
- YouTube matching
- Queue system

### Sprint 2 ✅ - Desktop UI
- Electron app
- Modern interface
- Hotkeys
- Notifications

### Sprint 3 ✅ - Advanced Features
- Equalizer
- History tracking
- Favorites system

### Sprint 4 ✅ - UI Enhancement
- EQ controls
- History view
- Statistics page

### Sprint 5 ✅ - Optimization
- Batch downloads
- Progressive streaming
- Audio visualizer

### Sprint 6 ✅ - Cross-Platform
- Web player (Next.js)
- Mobile app (React Native)
- Complete documentation

### Future Ideas 🔮
- [ ] Collaborative playlists
- [ ] Social features
- [ ] Podcast support
- [ ] Chromecast integration
- [ ] Discord Rich Presence
- [ ] Last.fm scrobbling
- [ ] Lyrics synchronization
- [ ] Custom themes
- [ ] Plugin system

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- **Python**: PEP 8
- **TypeScript/JavaScript**: ESLint + Prettier
- **Commits**: Conventional Commits

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## ⚠️ Legal Disclaimer

This project is for **educational purposes only**. 

- Uses Spotify API for metadata (requires account)
- Streams audio from YouTube (public platform)
- Respects all API terms of service
- No music piracy or copyright infringement
- Users responsible for compliance with local laws

---

## 👥 Authors

- **Daniel Calixto** - Initial work - [@Soldad17-u](https://github.com/Soldad17-u)

---

## 🚀 Deploy Guides

See `/docs/deployment/` for detailed deployment instructions:

- [Backend Deployment](docs/deployment/BACKEND.md)
- [Web Deployment](docs/deployment/WEB.md)
- [Mobile Deployment](docs/deployment/MOBILE.md)
- [Docker Deployment](docs/deployment/DOCKER.md)

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Soldad17-u/spotify-youtube-player/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Soldad17-u/spotify-youtube-player/discussions)
- **Email**: daniel.calixto@cs.cruzeirodosul.edu.br

---

## ⭐ Show Your Support

Give a ⭐ if this project helped you!

---

<div align="center">

**Made with ❤️ and lots of ☕**

🎵 Happy Listening! 🎵

</div>