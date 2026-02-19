from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from dotenv import load_dotenv

from music_matcher import MusicMatcher
from audio_cache import AudioCache
from audio_player import AudioPlayer

load_dotenv()

app = FastAPI(title="Spotify YouTube Player API")

# CORS para permitir frontend Electron
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa componentes
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
    scope="user-library-read playlist-read-private user-top-read user-read-recently-played"
))

matcher = MusicMatcher()
cache = AudioCache()
player = AudioPlayer()

class PlayRequest(BaseModel):
    track_id: str

@app.get("/")
async def root():
    return {"message": "Spotify YouTube Player API", "status": "running"}

@app.get("/search")
async def search(q: str, limit: int = 20):
    """
    Busca músicas no Spotify
    """
    try:
        results = sp.search(q=q, limit=limit, type='track')
        return {"tracks": results['tracks']['items']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/track/{track_id}")
async def get_track(track_id: str):
    """
    Obtém metadados de uma música específica
    """
    try:
        track = sp.track(track_id)
        return track
    except Exception as e:
        raise HTTPException(status_code=404, detail="Track not found")

@app.post("/play/{track_id}")
async def play_track(track_id: str, background_tasks: BackgroundTasks):
    """
    Reproduz uma música
    - Busca no cache primeiro
    - Se não existir, faz matching Spotify->YouTube e baixa
    - Inicia reprodução
    """
    try:
        # Busca metadados no Spotify
        track = sp.track(track_id)
        
        # Verifica cache
        cached_file = cache.get_cached_audio(track_id)
        
        if not cached_file:
            # Faz matching e download
            yt_url = matcher.spotify_to_youtube(
                track['name'],
                track['artists'][0]['name'],
                track['duration_ms']
            )
            
            if not yt_url:
                raise HTTPException(status_code=404, detail="Could not find matching YouTube video")
            
            # Download em background
            cached_file = cache.download_and_cache(yt_url, track_id)
        
        # Toca
        player.play(cached_file)
        
        return {
            "status": "playing",
            "track": {
                "id": track['id'],
                "name": track['name'],
                "artist": track['artists'][0]['name'],
                "album": track['album']['name'],
                "image": track['album']['images'][0]['url'] if track['album']['images'] else None,
                "duration_ms": track['duration_ms']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pause")
async def pause():
    """
    Pausa reprodução
    """
    player.pause()
    return {"status": "paused"}

@app.post("/resume")
async def resume():
    """
    Resume reprodução
    """
    player.resume()
    return {"status": "playing"}

@app.post("/stop")
async def stop():
    """
    Para reprodução
    """
    player.stop()
    return {"status": "stopped"}

@app.get("/status")
async def get_status():
    """
    Retorna status atual do player
    """
    return {
        "is_playing": player.is_playing(),
        "current_track": player.current_track,
        "position": player.get_position(),
        "volume": player.get_volume()
    }

@app.post("/volume/{level}")
async def set_volume(level: int):
    """
    Ajusta volume (0-100)
    """
    if level < 0 or level > 100:
        raise HTTPException(status_code=400, detail="Volume must be between 0 and 100")
    
    player.set_volume(level)
    return {"volume": level}

@app.get("/playlists")
async def get_playlists(limit: int = 50):
    """
    Lista playlists do usuário
    """
    try:
        playlists = sp.current_user_playlists(limit=limit)
        return {"playlists": playlists['items']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/playlist/{playlist_id}")
async def get_playlist_tracks(playlist_id: str):
    """
    Obtém músicas de uma playlist
    """
    try:
        results = sp.playlist_tracks(playlist_id)
        tracks = [item['track'] for item in results['items'] if item['track']]
        return {"tracks": tracks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/queue/add/{track_id}")
async def add_to_queue(track_id: str):
    """
    Adiciona música à fila
    """
    player.add_to_queue(track_id)
    return {"status": "added to queue", "track_id": track_id}

@app.post("/queue/next")
async def play_next():
    """
    Toca próxima música da fila
    """
    next_track_id = player.next_track()
    if next_track_id:
        return await play_track(next_track_id, BackgroundTasks())
    else:
        return {"status": "queue empty"}

@app.get("/queue")
async def get_queue():
    """
    Retorna fila de reprodução
    """
    return {"queue": player.queue}

if __name__ == "__main__":
    import uvicorn
    print("🎵 Starting Spotify YouTube Player API...")
    print("🔗 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)