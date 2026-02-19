# 📱 Mobile Deployment Guide

## Overview

Deploy React Native mobile app to iOS App Store and Google Play Store using Expo EAS Build.

---

## Prerequisites

- Expo account (free)
- Apple Developer account ($99/year) for iOS
- Google Play Developer account ($25 one-time) for Android
- EAS CLI installed

---

## Setup EAS Build

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure Project

```bash
cd mobile
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Android Build

### 1. Build APK (Testing)

```bash
eas build --platform android --profile preview
```

Download APK and test on device.

### 2. Build AAB (Production)

```bash
eas build --platform android --profile production
```

### 3. Submit to Google Play

#### First Time Setup

1. **Create App on Google Play Console**
   - Go to [play.google.com/console](https://play.google.com/console)
   - Create new app
   - Fill app details

2. **Generate Service Account**
   ```bash
   # Follow prompts
   eas submit --platform android
   ```

3. **Upload Assets**
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (min 2)
   - Privacy policy URL

#### Subsequent Releases

```bash
eas submit --platform android --latest
```

---

## iOS Build

### 1. Apple Developer Setup

1. **Join Apple Developer Program**
   - $99/year
   - [developer.apple.com](https://developer.apple.com)

2. **Create App ID**
   - Identifier: `com.spotifyyoutube.mobile`
   - Capabilities: Background Audio

3. **App Store Connect**
   - Create new app
   - Bundle ID: `com.spotifyyoutube.mobile`

### 2. Build IPA

```bash
eas build --platform ios --profile production
```

EAS will handle:
- Provisioning profiles
- Certificates
- Code signing

### 3. Submit to App Store

```bash
eas submit --platform ios --latest
```

### 4. App Store Review

**Prepare:**
- App screenshots (required sizes)
- App preview video (optional)
- Description
- Keywords
- Support URL
- Privacy policy

**Review checklist:**
- Test thoroughly
- No crashes
- No placeholder content
- Clear purpose
- Privacy policy
- Follow guidelines

---

## Environment Variables

### Set Secrets

```bash
eas secret:create --scope project --name API_URL --value https://your-backend.com
```

### Use in app.json

```json
{
  "expo": {
    "extra": {
      "apiUrl": process.env.API_URL
    }
  }
}
```

### Access in Code

```typescript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.apiUrl;
```

---

## App Icons & Splash

### Generate Assets

```bash
# Install generator
npm install -g @expo/configure-splash-screen

# Generate splash
npx @expo/configure-splash-screen
```

### Icon Sizes

**iOS:**
- 1024x1024 (App Store)
- Various sizes for devices

**Android:**
- 512x512 (Play Store)
- Adaptive icon (foreground + background)

### Tools

- [Figma](https://figma.com) - Design
- [App Icon Generator](https://appicon.co) - Generate all sizes
- [Expo Icon](https://github.com/expo/expo-cli/tree/main/packages/expo-cli/src/commands/prepare-assets) - CLI tool

---

## Over-the-Air Updates (OTA)

### Setup EAS Update

```bash
eas update:configure
```

### Publish Update

```bash
# Build and publish
eas update --branch production --message "Fix bug"
```

### Benefits

- Skip app store review
- Instant updates
- Rollback capability
- A/B testing

### Limitations

- JS/assets only (no native code changes)
- App store policies apply

---

## Testing

### Internal Testing

**Android:**
- Upload to internal testing track
- Add testers by email

**iOS:**
- TestFlight
- Add testers
- Get feedback

### Beta Testing

```bash
# Build beta
eas build --platform all --profile preview

# Submit to beta
eas submit --platform android --track beta
```

---

## App Store Optimization (ASO)

### Keywords

**Android:**
- Short description (80 chars)
- Full description (4000 chars)

**iOS:**
- Subtitle (30 chars)
- Keywords (100 chars)
- Description (4000 chars)

### Screenshots

**Required sizes:**

**iOS:**
- 6.5" (iPhone 14 Pro Max): 1284x2778
- 5.5" (iPhone 8 Plus): 1242x2208
- 12.9" (iPad Pro): 2048x2732

**Android:**
- Phone: 1080x1920 min
- Tablet: 1536x2048 min
- 7-inch tablet: 1024x1600 min

### Tips

- Unique app name
- Clear description
- High-quality screenshots
- Regular updates
- Respond to reviews

---

## Analytics

### Firebase Analytics

```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

```typescript
import analytics from '@react-native-firebase/analytics';

// Log event
await analytics().logEvent('play_track', {
  track_id: 'abc123',
  track_name: 'Song Name',
});
```

### Amplitude

```bash
npm install @amplitude/analytics-react-native
```

```typescript
import { init, track } from '@amplitude/analytics-react-native';

init('YOUR_API_KEY');
track('Play Track', { trackId: 'abc123' });
```

---

## Crash Reporting

### Sentry

```bash
npm install @sentry/react-native
```

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_DSN',
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});
```

---

## Performance Monitoring

### React Native Performance

```bash
npm install react-native-performance
```

### Flipper

- Built-in debugging tool
- Network inspector
- Layout inspector
- Performance monitor

---

## Troubleshooting

### Issue: Build fails

```bash
# Clear cache
eas build:clear-cache

# Retry
eas build --platform android --profile production --clear-cache
```

### Issue: App crashes on launch

- Check Sentry logs
- Test on physical device
- Review native dependencies

### Issue: Slow app

- Use React DevTools Profiler
- Optimize images
- Reduce bundle size
- Use FlatList properly

---

## App Store Rejections

### Common Reasons

1. **Crashes** - Test thoroughly
2. **Missing info** - Complete metadata
3. **Privacy** - Add privacy policy
4. **Content** - Follow guidelines
5. **Incomplete** - Functional app required

### Appeal Process

- Resolution Center
- Provide details
- Fix and resubmit

---

## Cost Summary

| Item | Cost | Frequency |
|------|------|----------|
| Apple Developer | $99 | Yearly |
| Google Play | $25 | One-time |
| Expo (free tier) | $0 | - |
| Expo (paid) | $29/mo | Optional |
| EAS Build (free) | 30 builds/mo | - |
| Domain | $10-20 | Yearly |

**Total first year:** ~$125-$150

---

## Checklist

### Pre-Launch

- [ ] Test on real devices (iOS + Android)
- [ ] All features working
- [ ] No crashes
- [ ] Fast performance
- [ ] Proper error handling
- [ ] Analytics integrated
- [ ] Crash reporting setup
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Support email

### Launch

- [ ] Build production versions
- [ ] Submit to stores
- [ ] Prepare marketing materials
- [ ] Social media ready
- [ ] Landing page live

### Post-Launch

- [ ] Monitor analytics
- [ ] Respond to reviews
- [ ] Fix bugs quickly
- [ ] Regular updates
- [ ] Engage users

---

## Next Steps

1. ✅ Mobile apps deployed
2. 📊 Monitor usage
3. 🐛 Fix bugs
4. ⭐ Get reviews
5. 📈 Grow user base

---

**Mobile deployment complete!** 📱