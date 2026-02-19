# Spotify YouTube Web Player

## 🌐 Web version of the hybrid music player

### Features
- 🔍 Search tracks from Spotify
- ▶️ Play music via YouTube backend
- 🎚️ Full player controls
- 📋 Queue management
- 🎵 Equalizer
- ❤️ Favorites
- 📊 History
- 📱 Responsive design
- 🌙 Dark theme

### Setup

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

### Environment

Create `.env.local`:
```
API_URL=http://localhost:8000
```

### Tech Stack
- Next.js 14
- React 18
- Tailwind CSS
- TypeScript
- Axios

### Deploy

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

### Requirements
- Backend running on port 8000
- Node.js 18+
- npm or yarn