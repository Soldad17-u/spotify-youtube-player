# 🌐 Web Deployment Guide

## Overview

Deploy the Next.js web player to production. Multiple hosting options.

---

## Option 1: Vercel (Recommended) ⭐

**Pros:** Made for Next.js, automatic, fast, free SSL
**Cons:** Free tier has limits
**Cost:** Free for hobby, Pro from $20/month

### Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd web
   vercel
   ```

4. **Configure**
   - Root Directory: `web`
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://your-backend.railway.app
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

7. **Custom Domain**
   ```bash
   vercel domains add yourdomain.com
   # Follow DNS instructions
   ```

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

---

## Option 2: Netlify

**Pros:** Simple, good free tier, form handling
**Cons:** Slightly slower than Vercel for Next.js
**Cost:** Free tier, Pro from $19/month

### Steps

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   cd web
   netlify init
   ```

4. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

5. **Environment Variables**
   ```bash
   netlify env:set NEXT_PUBLIC_API_URL https://your-backend.com
   ```

6. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Option 3: Cloudflare Pages

**Pros:** Fast CDN, unlimited bandwidth on free tier
**Cons:** Newer service, fewer integrations
**Cost:** Free for most use cases

### Steps

1. **Connect Repository**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Connect GitHub
   - Select repository

2. **Configure Build**
   ```
   Framework: Next.js
   Build command: npm run build
   Build output: .next
   Root directory: web
   ```

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.com
   NODE_VERSION=18
   ```

4. **Deploy**
   - Automatic on Git push

---

## Option 4: AWS Amplify

**Pros:** AWS integration, scalable
**Cons:** More complex, AWS pricing
**Cost:** Free tier 1000 build minutes/month

### Steps

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize**
   ```bash
   cd web
   amplify init
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   # Select: Amazon CloudFront and S3
   ```

4. **Configure**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

5. **Deploy**
   ```bash
   amplify publish
   ```

---

## Static Export (Alternative)

If you want pure static hosting:

### Configure Next.js for Static Export

```js
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

### Build

```bash
npm run build
# Output in /out directory
```

### Deploy to Any Static Host

**Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/spotify-youtube-web/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache:**
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/spotify-youtube-web/out
    
    <Directory /var/www/spotify-youtube-web/out>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

## Environment Variables

**Required:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend.com
```

**Optional:**
```bash
NEXT_PUBLIC_APP_NAME="Spotify YouTube Player"
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

---

## Custom Domain Setup

### DNS Configuration

**For Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Netlify:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

**For Cloudflare:**
- Automatic if domain on Cloudflare

---

## SSL Certificate

All platforms provide free SSL automatically via Let's Encrypt.

**Force HTTPS:**

Add to `next.config.js`:
```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        }
      ]
    }
  ]
}
```

---

## Performance Optimization

### Image Optimization

```js
// next.config.js
module.exports = {
  images: {
    domains: ['i.scdn.co', 'mosaic.scdn.co'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Caching

```js
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your config
})
```

Run:
```bash
ANALYZE=true npm run build
```

---

## Monitoring

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Google Analytics

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  )
}
```

---

## Testing Production Build

```bash
# Build
npm run build

# Start production server locally
npm start

# Test
curl http://localhost:3000
```

---

## Troubleshooting

### Issue: Build fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Environment variables not working
- Must start with `NEXT_PUBLIC_` for client-side
- Restart dev server after changes
- Check platform dashboard

### Issue: Images not loading
- Add domain to `next.config.js` images.domains
- Check CORS headers

---

## Cost Comparison

| Provider | Free Tier | Bandwidth | Build Minutes |
|----------|-----------|-----------|---------------|
| Vercel | Yes | 100GB/mo | Unlimited |
| Netlify | Yes | 100GB/mo | 300 min/mo |
| Cloudflare | Yes | Unlimited | 500 min/mo |
| AWS Amplify | Yes | 15GB/mo | 1000 min/mo |

---

## Next Steps

1. ✅ Web deployed
2. 📱 Deploy mobile ([MOBILE.md](MOBILE.md))
3. 🔗 Connect to backend
4. 📊 Add analytics
5. 🚀 Launch!

---

**Web deployment complete!** 🌐