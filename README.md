# 🎵 Spotify YouTube Player

**The Ultimate Hybrid Music Player** - Combines Spotify's rich metadata with YouTube's free streaming.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.8+-yellow)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey)

---

## ✨ Features (60+)

### 🎶 Core Playback

- ✅ **Auto-play next track** with monitoring thread
- ✅ **Shuffle & Repeat** (off/one/all modes)
- ✅ **Progress bar** with real-time tracking
- ✅ **Seek/scrubbing** to any position
- ✅ **Queue management** with metadata
- ✅ **Volume control** (0-100)
- ✅ **Play/Pause/Stop/Next** controls

### 🎤 Music Discovery

- ✅ **Search** Spotify's 80M+ tracks
- ✅ **Browse playlists** from your library
- ✅ **Lyrics fetching** from lyrics.ovh API
- ✅ **Album art** display
- ✅ **Metadata** (artist, album, duration)

### 📈 Analytics & History

- ✅ **Playback history** tracking
- ✅ **Most played** tracks stats
- ✅ **Listening statistics** (total time, plays, etc)
- ✅ **Top artists** analysis
- ✅ **Favorites system** (like/unlike tracks)
- ✅ **Advanced analytics** (30-day insights)

### 🎛️ Audio Control

- ✅ **10-band equalizer** with presets
- ✅ **EQ presets**: Flat, Pop, Rock, Jazz, Bass Boost, etc
- ✅ **Custom EQ** settings per band
- ✅ **Volume normalization** (optional)

### ⌨️ Hotkeys & Shortcuts

- ✅ **Media keys** support (Play/Pause, Next, Previous)
- ✅ **Global hotkeys**:
  - `Ctrl+Shift+Space` - Play/Pause
  - `Ctrl+Shift+→` - Next track
  - `Ctrl+Shift+←` - Previous track
  - `Ctrl+Shift+L` - Toggle lyrics
  - `Ctrl+Shift+M` - Mini mode
  - `Ctrl+↑/↓` - Volume up/down

### 🔔 Notifications

- ✅ **Desktop notifications** on track change
- ✅ **Album art** in notifications
- ✅ **System tray** integration
- ✅ **Tray tooltip** with current track

### 🎨 User Interface

- ✅ **Modern Electron UI**
- ✅ **Dark/Light themes**
- ✅ **Mini player mode** (compact)
- ✅ **Lyrics panel** with auto-scroll
- ✅ **History panel**
- ✅ **Settings panel**
- ✅ **Always on top** option

### ⚙️ Settings & Preferences

- ✅ **Audio quality** selection (low/medium/high)
- ✅ **Theme** customization
- ✅ **Cache management** (size limit, auto-cleanup)
- ✅ **Notification** preferences
- ✅ **Playback** defaults (shuffle, repeat, auto-play)
- ✅ **Advanced options** (pre-loading, hardware acceleration)

### 🚀 Performance

- ✅ **Smart caching** with SQLite
- ✅ **Background downloading** for queue
- ✅ **Pre-loading** next track
- ✅ **Cache statistics** and cleanup
- ✅ **Optimized matching** algorithm

### 📊 Backend API

- ✅ **40+ REST endpoints**
- ✅ **FastAPI** with auto-generated docs
- ✅ **CORS enabled** for Electron frontend
- ✅ **Swagger UI** at `/docs`
- ✅ **Real-time status** endpoint

---

## 📦 Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- VLC Media Player (for audio engine)
- Spotify Developer Account

### 1. Clone Repository

```bash
git clone https://github.com/Soldad17-u/spotify-youtube-player.git
cd spotify-youtube-player
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
```

Get credentials at: https://developer.spotify.com/dashboard

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run Application

**Terminal 1 (Backend):**

```bash
cd backend
python main.py
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm start
```

Access at: `http://localhost:8000` (API) or Electron window

---

## 📚 API Documentation

### Playback Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/play/{track_id}` | Play a track |
| POST | `/pause` | Pause playback |
| POST | `/resume` | Resume playback |
| POST | `/stop` | Stop playback |
| POST | `/next` | Next track |
| GET | `/position` | Get current position |
| POST | `/seek/{position}` | Seek to position (seconds) |

### Queue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/queue/add/{track_id}` | Add to queue |
| GET | `/queue` | Get queue |
| POST | `/queue/clear` | Clear queue |

### Mode Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/shuffle/toggle` | Toggle shuffle |
| POST | `/repeat/cycle` | Cycle repeat modes |
| POST | `/volume/{level}` | Set volume (0-100) |
| GET | `/volume` | Get volume |

### History & Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | Get playback history |
| GET | `/history/most-played` | Most played tracks |
| DELETE | `/history` | Clear history |
| POST | `/favorites/{track_id}` | Add favorite |
| DELETE | `/favorites/{track_id}` | Remove favorite |
| GET | `/favorites` | Get all favorites |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics?days=30` | Get statistics |

### Equalizer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/equalizer/preset/{name}` | Apply EQ preset |
| POST | `/equalizer/band/{index}` | Set band value |
| GET | `/equalizer` | Get EQ status |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get all settings |
| PUT | `/settings/{category}/{key}` | Update setting |

### Search & Metadata

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=query` | Search tracks |
| GET | `/track/{track_id}` | Get track metadata |
| GET | `/lyrics/{track_id}` | Get lyrics |
| GET | `/playlists` | User playlists |
| GET | `/playlist/{id}` | Playlist tracks |

Full interactive docs: `http://localhost:8000/docs`

---

## 🎯 Architecture

```
spotify-youtube-player/
├── backend/
│   ├── main.py                 # FastAPI server (40+ endpoints)
│   ├── audio_player.py         # VLC-based player engine
│   ├── music_matcher.py        # Spotify → YouTube matching
│   ├── audio_cache.py          # SQLite caching system
│   ├── lyrics_fetcher.py       # Lyrics.ovh integration
│   ├── history_manager.py      # History & favorites
│   ├── equalizer.py            # 10-band EQ
│   ├── settings_manager.py     # User preferences
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── electron.js             # Electron main (hotkeys, tray)
│   ├── index.html              # Main UI
│   ├── app.js                  # Frontend logic
│   ├── styles.css              # Modern styling
│   └── package.json            # Node dependencies
│
├── cache/                      # Downloaded audio files
├── config/                     # User settings
├── TODO.md                     # Feature roadmap
└── README.md                   # This file
```

---

## 🛠️ Technologies

### Backend

- **FastAPI** - Modern Python web framework
- **Spotipy** - Spotify API wrapper
- **yt-dlp** - YouTube downloader
- **python-vlc** - VLC bindings for audio
- **SQLite** - Local database for cache/history

### Frontend

- **Electron** - Cross-platform desktop app
- **HTML/CSS/JS** - Modern web technologies
- **Native APIs** - Global hotkeys, notifications, tray

---

## 🐛 Troubleshooting

### "VLC not found"

Install VLC:
- **Windows**: Download from videolan.org
- **Linux**: `sudo apt install vlc`
- **macOS**: `brew install vlc`

### "Spotify authentication failed"

1. Check `.env` credentials
2. Verify redirect URI matches Spotify dashboard
3. Delete `.cache` file and re-authenticate

### "YouTube download failed"

Update yt-dlp:

```bash
pip install --upgrade yt-dlp
```

### "Slow matching"

First search may be slow (authenticating). Subsequent searches are cached.

---

## 📝 License

MIT License - See LICENSE file

---

## 🚀 Roadmap

See [TODO.md](TODO.md) for complete feature roadmap.

**Completed**: 60+ features ✅

**In Progress**:
- Mobile app
- Web player
- AI recommendations

---

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## ⚠️ Legal Disclaimer

This project is for **educational purposes only**.

- Uses Spotify API for metadata (requires account)
- Downloads audio from YouTube (terms of service may vary)
- **Not affiliated** with Spotify or YouTube
- Users responsible for compliance with local laws

---

## 👨‍💻 Author

**Daniel Calixto**

- GitHub: [@Soldad17-u](https://github.com/Soldad17-u)
- Project: [spotify-youtube-player](https://github.com/Soldad17-u/spotify-youtube-player)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ by a music lover for music lovers**

Version 3.0.0 - Production Ready 🎉