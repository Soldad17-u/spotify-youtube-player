# Spotify YouTube Mobile App

## 📱 Native mobile app for iOS and Android

### Features
- 🔍 Search tracks
- ▶️ Play music
- 📋 Queue management
- ❤️ Favorites
- 🕐 History
- 📊 Statistics
- 🔔 Push notifications
- 💾 Offline mode
- 🎨 Native UI

### Tech Stack
- React Native
- Expo
- TypeScript
- React Navigation
- Axios

### Setup

```bash
cd mobile
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

### Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build Android APK
npm run build:android

# Build iOS
npm run build:ios
```

### Environment

Create `.env`:
```
API_URL=http://your-backend-url:8000
```

### Requirements
- Node.js 18+
- Expo CLI
- Android Studio (for Android)
- Xcode (for iOS, Mac only)
- Backend running