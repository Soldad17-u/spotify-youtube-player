# 🛠️ Installation Guide

## Overview

Complete step-by-step installation guide for all platforms.

---

## 💻 System Requirements

### Minimum

- **CPU**: Dual-core 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 2 GB free space
- **OS**: Windows 10, macOS 10.15, Ubuntu 20.04+

### Recommended

- **CPU**: Quad-core 2.5 GHz+
- **RAM**: 8 GB+
- **Storage**: 10 GB+ free (for cache)
- **Network**: Broadband internet

---

## 📦 Prerequisites

### 1. Python 3.9+

**Windows:**
```bash
# Download from python.org
winget install Python.Python.3.11

# Verify
python --version
```

**macOS:**
```bash
# Install Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.11

# Verify
python3 --version
```

**Linux:**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Verify
python3 --version
```

### 2. Node.js 18+

**Windows:**
```bash
winget install OpenJS.NodeJS.LTS
```

**macOS:**
```bash
brew install node@18
```

**Linux:**
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### 3. VLC Media Player

**Windows:**
```bash
winget install VideoLAN.VLC
```

**macOS:**
```bash
brew install --cask vlc
```

**Linux:**
```bash
sudo apt install vlc python3-vlc
```

**Important:** Install 64-bit version matching your Python architecture.

### 4. FFmpeg (Optional but recommended)

**Windows:**
```bash
winget install Gyan.FFmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### 5. Git

**Windows:**
```bash
winget install Git.Git
```

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt install git
```

---

## 👥 Get Spotify API Credentials

1. **Go to Spotify Developer Dashboard**
   - Visit [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   - Log in with your Spotify account

2. **Create New App**
   - Click "Create an App"
   - Name: "My Music Player"
   - Description: "Personal music player"
   - Click "Create"

3. **Get Credentials**
   - Copy **Client ID**
   - Click "Show Client Secret"
   - Copy **Client Secret**

4. **Add Redirect URI**
   - Click "Edit Settings"
   - Add Redirect URI: `http://localhost:8888/callback`
   - Click "Save"

---

## 💾 Installation Steps

### Step 1: Clone Repository

```bash
# Clone
git clone https://github.com/Soldad17-u/spotify-youtube-player.git

# Navigate
cd spotify-youtube-player
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env (use your favorite editor)
nano .env  # or notepad .env on Windows
```

Add your credentials:
```bash
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
```

### Step 4: Test Backend

```bash
# Start server
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Open browser: `http://localhost:8000/docs`

If you see Swagger UI, backend is working! ✅

### Step 5: Desktop App (Optional)

```bash
# New terminal window
cd frontend

# Install dependencies
npm install

# Start Electron app
npm start
```

Electron window should open automatically.

### Step 6: Web App (Optional)

```bash
# New terminal
cd web

# Install
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

Open: `http://localhost:3000`

### Step 7: Mobile App (Optional)

```bash
# New terminal
cd mobile

# Install
npm install

# Install Expo Go on your phone
# iOS: App Store
# Android: Google Play

# Start Expo
npm start

# Scan QR code with Expo Go app
```

---

## ✅ Verification

### Backend Health Check

```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Test Search

```bash
curl "http://localhost:8000/search?q=test&limit=5"
# Should return JSON with tracks
```

### Test Play (will actually play music!)

```bash
# Get a track ID from search results, then:
curl -X POST "http://localhost:8000/play/TRACK_ID_HERE"
```

---

## 🐛 Troubleshooting

### Python Issues

**Issue: `python` command not found**
```bash
# Try python3 instead
python3 --version

# Or add to PATH (Windows)
# Search "Environment Variables" in Start Menu
# Add Python installation directory to PATH
```

**Issue: pip install fails**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install wheel
pip install wheel

# Try again
pip install -r requirements.txt
```

### VLC Issues

**Issue: "VLC not found" or "Could not find libvlc"**

**Windows:**
- Reinstall VLC (64-bit)
- Make sure Python is also 64-bit
- Add VLC to PATH:
  ```
  C:\Program Files\VideoLAN\VLC
  ```

**macOS:**
```bash
# Reinstall VLC
brew reinstall vlc

# Install python-vlc specifically
pip install python-vlc
```

**Linux:**
```bash
# Install both VLC and Python bindings
sudo apt install vlc libvlc-dev python3-vlc

# If still doesn't work
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
```

### Port Already in Use

**Issue: "Address already in use" on port 8000**

**Windows:**
```bash
# Find process
netstat -ano | findstr :8000

# Kill process (use PID from previous command)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill
lsof -ti:8000 | xargs kill -9
```

### Spotify API Issues

**Issue: "Invalid client" or authentication errors**

1. Double-check credentials in `.env`
2. Verify redirect URI matches exactly:
   - Dashboard: `http://localhost:8888/callback`
   - .env: `http://localhost:8888/callback`
3. Try regenerating Client Secret

**Issue: "Insufficient client scope"**

- App needs basic read permissions only
- Try removing and re-adding the app

### YouTube Download Issues

**Issue: "Unable to extract video data"**

- Some videos are region-locked
- Video might be private/deleted
- Try another track
- Update yt-dlp:
  ```bash
  pip install --upgrade yt-dlp
  ```

### Frontend Won't Connect

**Issue: "Network Error" or "Failed to fetch"**

1. Verify backend is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check CORS settings in backend

3. Check browser console for errors

4. Try different browser

5. Disable browser extensions

### Performance Issues

**Issue: Slow playback or stuttering**

- First play downloads audio (takes time)
- Subsequent plays use cache (instant)
- Check internet speed
- Lower audio quality settings
- Close other applications

**Issue: High CPU usage**

- Disable visualizer
- Close frontend while using web/mobile
- Update VLC to latest version

---

## 🔧 Advanced Configuration

### Custom Port

**Backend:**
```bash
# Edit main.py
uvicorn.run(app, host="0.0.0.0", port=9000)  # Change 8000 to 9000
```

**Web/Desktop:**
Update API URL in environment files.

### Cache Location

**Backend:**
Add to `.env`:
```bash
CACHE_DIR=/custom/path/to/cache
```

### Database Location

Add to `.env`:
```bash
DB_PATH=/custom/path/to/database.db
```

---

## 🚀 What's Next?

1. ✅ Backend running
2. ✅ Frontend working
3. 🎵 Start listening!
4. 📚 Read [README.md](README.md) for features
5. 🐛 Report issues on GitHub
6. ⭐ Star the repo if you like it!

---

## 📚 Additional Resources

- [README.md](README.md) - Project overview
- [TODO.md](TODO.md) - Roadmap
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
- [docs/deployment/](docs/deployment/) - Deployment guides

---

## 💬 Need Help?

- **GitHub Issues**: [Open an issue](https://github.com/Soldad17-u/spotify-youtube-player/issues)
- **Email**: daniel.calixto@cs.cruzeirodosul.edu.br

---

**Happy listening!** 🎵