# 🐳 Docker Deployment Guide

## Overview

Containerize the entire application for easy deployment and scaling.

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/your-username/spotify-youtube-player.git
cd spotify-youtube-player

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Start with Docker Compose
docker-compose up -d
```

App available at:
- Backend: `http://localhost:8000`
- Web: `http://localhost:3000`

---

## Docker Files

### Backend Dockerfile

`backend/Dockerfile`:

```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    vlc \
    python3-vlc \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p /app/cache /app/data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Web Dockerfile

`web/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run
CMD ["npm", "start"]
```

---

## Docker Compose

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: spotify-youtube-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
      - SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
      - SPOTIFY_REDIRECT_URI=${SPOTIFY_REDIRECT_URI}
      - GENIUS_ACCESS_TOKEN=${GENIUS_ACCESS_TOKEN}
    volumes:
      - backend-cache:/app/cache
      - backend-data:/app/data
    networks:
      - spotify-youtube-network
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: spotify-youtube-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - spotify-youtube-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: spotify-youtube-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - web
    networks:
      - spotify-youtube-network

volumes:
  backend-cache:
  backend-data:

networks:
  spotify-youtube-network:
    driver: bridge
```

---

## Nginx Configuration

`nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream web {
        server web:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Web app
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API
        location /api/ {
            rewrite ^/api/(.*) /$1 break;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support (if needed)
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

---

## Environment File

`.env`:

```bash
# Spotify API
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback

# Optional
GENIUS_ACCESS_TOKEN=your_genius_token

# Database
DB_PATH=/app/data/app.db

# Cache
CACHE_DIR=/app/cache
```

---

## Commands

### Build

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
```

### Start

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### Stop

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Restart

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

---

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml spotify-youtube

# List services
docker stack services spotify-youtube

# Scale service
docker service scale spotify-youtube_backend=3
```

### Kubernetes

See `kubernetes/` directory for manifests.

---

## Monitoring

### Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Stats

```bash
# Resource usage
docker stats

# Specific container
docker stats spotify-youtube-backend
```

---

## Backup & Restore

### Backup

```bash
# Backup volumes
docker run --rm \
  -v spotify-youtube_backend-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data

# Backup database
docker exec spotify-youtube-backend \
  sqlite3 /app/data/app.db ".backup /app/data/backup.db"

docker cp spotify-youtube-backend:/app/data/backup.db ./backup.db
```

### Restore

```bash
# Restore volume
docker run --rm \
  -v spotify-youtube_backend-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/data-backup.tar.gz -C /
```

---

## Security

### Best Practices

1. **Use secrets**
   ```yaml
   secrets:
     spotify_client_id:
       file: ./secrets/spotify_client_id.txt
   ```

2. **Run as non-root**
   ```dockerfile
   USER nobody
   ```

3. **Scan images**
   ```bash
   docker scan spotify-youtube-backend
   ```

4. **Update regularly**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## Troubleshooting

### Issue: Container won't start

```bash
# Check logs
docker-compose logs backend

# Inspect container
docker inspect spotify-youtube-backend

# Enter container
docker-compose exec backend /bin/bash
```

### Issue: Out of disk space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

### Issue: Network issues

```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

---

## Performance Tuning

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### Multi-stage Builds

Already implemented in Dockerfiles above.

### Layer Caching

- Copy package files first
- Install dependencies
- Then copy source code

---

## CI/CD Integration

### GitHub Actions

`.github/workflows/docker.yml`:

```yaml
name: Docker Build & Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          context: ./backend
          push: true
          tags: your-username/spotify-youtube-backend:latest
```

---

**Docker deployment complete!** 🐳