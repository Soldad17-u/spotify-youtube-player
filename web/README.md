# Spotify YouTube Web Player

## 🌐 Web-based music player

Responsive web interface for the Spotify YouTube hybrid player.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 📱 Features

- **Responsive Design** - Works on desktop, tablet, mobile
- **Progressive Web App** - Install as native app
- **Real-time Updates** - Live playback status
- **Touch Optimized** - Mobile-friendly controls
- **Dark Theme** - Spotify-inspired design

## 🔧 Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🌍 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t sy-web-player .
docker run -p 3000:3000 sy-web-player
```

## 📦 Tech Stack

- **Next.js 14** - React framework
- **TailwindCSS** - Styling
- **Axios** - API client
- **TypeScript** - Type safety

## 🔗 API

Backend API must be running:

```bash
cd ../backend
python main.py
```

Default: `http://localhost:8000`