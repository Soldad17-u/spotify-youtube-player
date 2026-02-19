# Spotify YouTube Mobile App

## 📱 Native mobile player for Android & iOS

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Installation

```bash
cd mobile
npm install
```

### Android

```bash
npm run android
```

### iOS (macOS only)

```bash
cd ios
pod install
cd ..
npm run ios
```

## ✨ Features

- **Native Performance** - Smooth 60 FPS
- **Touch Optimized** - Gesture controls
- **Background Play** - Continue playing when locked
- **Offline Mode** - Cached playlists
- **Push Notifications** - Now playing updates

## 🔧 Configuration

Create `.env` file:

```env
API_URL=http://YOUR_SERVER_IP:8000
```

**Important:** Use your computer's LAN IP, not `localhost`!

```bash
# Find your IP:
# Windows
ipconfig

# macOS/Linux
ifconfig
```

## 🏛️ Architecture

```
mobile/
├── src/
│   ├── screens/       # App screens
│   ├── components/    # Reusable components
│   ├── navigation/    # React Navigation setup
│   ├── api/           # API client
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
├── android/           # Android native code
└── ios/               # iOS native code
```

## 📦 Build

### Android APK

```bash
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

### iOS (macOS only)

Open in Xcode and Archive.

## 🔗 Backend

Backend API must be accessible:

```bash
cd ../backend
python main.py
```

Default: `http://localhost:8000`