# 🚀 Backend Deployment Guide

## Overview

Deploy the Python FastAPI backend to production. Multiple options available.

---

## Option 1: Railway (Recommended) ⭐

**Pros:** Easy, free tier, auto-deploy from Git
**Cons:** Cold starts on free tier
**Cost:** Free tier available, paid from $5/month

### Steps

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize in backend folder
   cd backend
   railway init
   ```

3. **Configure Environment**
   ```bash
   railway variables set SPOTIFY_CLIENT_ID=your_id
   railway variables set SPOTIFY_CLIENT_SECRET=your_secret
   railway variables set SPOTIFY_REDIRECT_URI=https://your-app.railway.app/callback
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get URL**
   ```bash
   railway domain
   # Returns: https://your-app.railway.app
   ```

### railway.json

Create in backend folder:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Option 2: Render

**Pros:** Simple, auto-SSL, good free tier
**Cons:** Slower cold starts than Railway
**Cost:** Free tier available, paid from $7/month

### Steps

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Connect GitHub

2. **New Web Service**
   - Click "New +" → "Web Service"
   - Select your repository
   - Root directory: `backend`

3. **Configure**
   ```
   Name: spotify-youtube-backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Environment Variables**
   ```
   SPOTIFY_CLIENT_ID=your_id
   SPOTIFY_CLIENT_SECRET=your_secret
   SPOTIFY_REDIRECT_URI=https://your-app.onrender.com/callback
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Auto-deploys on Git push

---

## Option 3: DigitalOcean App Platform

**Pros:** Powerful, scalable, good docs
**Cons:** No free tier
**Cost:** From $5/month

### Steps

1. **Create Droplet or App**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create App Platform app

2. **Configure**
   ```yaml
   name: spotify-youtube-backend
   services:
   - name: api
     github:
       repo: your-username/spotify-youtube-player
       branch: main
       deploy_on_push: true
     source_dir: /backend
     run_command: uvicorn main:app --host 0.0.0.0 --port 8080
     http_port: 8080
   ```

3. **Environment Variables**
   - Add in App Platform dashboard

---

## Option 4: AWS EC2

**Pros:** Full control, scalable
**Cons:** More complex, no auto-deploy
**Cost:** From $5/month (t2.micro)

### Steps

1. **Launch EC2 Instance**
   ```bash
   # Ubuntu 22.04 LTS
   # t2.micro (free tier eligible)
   ```

2. **SSH and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python
   sudo apt install python3.9 python3-pip python3-venv -y
   
   # Install VLC
   sudo apt install vlc python3-vlc -y
   ```

3. **Clone and Setup**
   ```bash
   git clone https://github.com/your-username/spotify-youtube-player.git
   cd spotify-youtube-player/backend
   
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Create .env**
   ```bash
   nano .env
   # Add your variables
   ```

5. **Setup Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/spotify-youtube.service
   ```

   ```ini
   [Unit]
   Description=Spotify YouTube Backend
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/spotify-youtube-player/backend
   Environment="PATH=/home/ubuntu/spotify-youtube-player/backend/venv/bin"
   ExecStart=/home/ubuntu/spotify-youtube-player/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Service**
   ```bash
   sudo systemctl enable spotify-youtube
   sudo systemctl start spotify-youtube
   sudo systemctl status spotify-youtube
   ```

7. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/spotify-youtube
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

8. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/spotify-youtube /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

---

## Docker Deployment

See [DOCKER.md](DOCKER.md) for complete Docker setup.

---

## Environment Variables

**Required:**
```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/callback
```

**Optional:**
```bash
GENIUS_ACCESS_TOKEN=your_genius_token  # For lyrics
PORT=8000                              # Default port
CACHE_DIR=/app/cache                   # Cache directory
DB_PATH=/app/data/app.db              # Database path
```

---

## Health Check

Test your deployment:

```bash
curl https://your-domain.com/health
# Should return: {"status": "healthy"}

curl https://your-domain.com/docs
# Should return Swagger UI HTML
```

---

## Monitoring

### Logs

**Railway:**
```bash
railway logs
```

**Render:**
- View in dashboard

**AWS/DigitalOcean:**
```bash
sudo journalctl -u spotify-youtube -f
```

### Metrics

Add to your backend:

```python
from prometheus_client import Counter, Histogram
import time

request_count = Counter('requests_total', 'Total requests')
request_duration = Histogram('request_duration_seconds', 'Request duration')
```

---

## Troubleshooting

### Issue: Port already in use
```bash
# Find process
lsof -i :8000
# Kill it
kill -9 <PID>
```

### Issue: VLC not found
```bash
# Install VLC
sudo apt install vlc python3-vlc -y
```

### Issue: Permission denied
```bash
# Fix permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/spotify-youtube-player
```

### Issue: Out of memory
- Upgrade instance size
- Add swap space:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```

---

## Cost Comparison

| Provider | Free Tier | Paid (Basic) | Paid (Pro) |
|----------|-----------|--------------|------------|
| Railway | 500 hrs/mo | $5/mo | $20/mo |
| Render | 750 hrs/mo | $7/mo | $25/mo |
| DigitalOcean | None | $5/mo | $12/mo |
| AWS EC2 | 750 hrs/mo | $5/mo | $20/mo |

---

## Next Steps

1. ✅ Backend deployed
2. 📱 Deploy frontend ([WEB.md](WEB.md))
3. 🔒 Setup custom domain
4. 📊 Add monitoring
5. 🔄 Setup CI/CD

---

**Deployment complete!** 🚀