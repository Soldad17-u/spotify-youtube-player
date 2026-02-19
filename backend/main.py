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

app = FastAPI(
    title="Spotify YouTube Player API",
    description="Hybrid music player using Spotify metadata + YouTube streaming",
    version="2.0.0"
)

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
    return {
        "message": "Spotify YouTube Player API",
        "status": "running",
        "version": "2.0.0",
        "features": [
            "Auto-play next track",
            "Shuffle and repeat modes",
            "Progress tracking",
            "Seek functionality",
            "Queue management"
        ]
    }

# ========== SEARCH & METADATA ==========

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

# ========== PLAYBACK CONTROL ==========

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
        
        # Preparar info da track
        track_info = {
            'id': track['id'],
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'duration': track['duration_ms'] / 1000
        }
        
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
        
        # Adicionar file_path ao track_info
        track_info['file_path'] = cached_file
        
        # Toca
        success = player.play(cached_file, track_info)
        
        if success:
            return {
                "status": "playing",
                "track": track_info
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to start playback")
            
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

@app.post("/next")
async def play_next_track(background_tasks: BackgroundTasks):
    """
    Toca próxima música da fila manualmente
    """
    next_track = player.play_next()
    
    if next_track:
        return {
            "status": "playing next",
            "track": next_track
        }
    else:
        return {
            "status": "queue empty",
            "message": "No more tracks in queue"
        }

# ========== POSITION & SEEKING ==========

@app.get("/position")
async def get_position():
    """
    Retorna posição atual detalhada (segundos + porcentagem)
    """
    return player.get_position()

@app.post("/seek/{position}")
async def seek(position: int):
    """
    Pula para posição específica (em segundos)
    
    Args:
        position: Posição em segundos
    """
    if position < 0:
        raise HTTPException(status_code=400, detail="Position must be >= 0")
    
    player.seek(position)
    return {
        "status": "seeked",
        "position": position,
        "current_position": player.get_position()
    }

# ========== SHUFFLE & REPEAT ==========

@app.post("/shuffle/toggle")
async def toggle_shuffle():
    """
    Alterna modo shuffle (on/off)
    """
    shuffle_on = player.toggle_shuffle()
    return {
        "shuffle": shuffle_on,
        "message": f"Shuffle {'enabled' if shuffle_on else 'disabled'}"
    }

@app.post("/repeat/cycle")
async def cycle_repeat():
    """
    Alterna entre modos de repeat: off → one → all → off
    """
    repeat_mode = player.cycle_repeat()
    return {
        "repeat": repeat_mode,
        "message": f"Repeat mode: {repeat_mode}"
    }

# ========== VOLUME ==========

@app.post("/volume/{level}")
async def set_volume(level: int):
    """
    Ajusta volume (0-100)
    """
    if level < 0 or level > 100:
        raise HTTPException(status_code=400, detail="Volume must be between 0 and 100")
    
    player.set_volume(level)
    return {"volume": level}

@app.get("/volume")
async def get_volume():
    """
    Retorna volume atual
    """
    return {"volume": player.get_volume()}

# ========== QUEUE MANAGEMENT ==========

@app.post("/queue/add/{track_id}")
async def add_to_queue(track_id: str, background_tasks: BackgroundTasks):
    """
    Adiciona música à fila (baixa em background se necessário)
    """
    try:
        # Buscar info no Spotify
        track = sp.track(track_id)
        
        track_info = {
            'id': track['id'],
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'duration': track['duration_ms'] / 1000
        }
        
        # Verificar cache e baixar se necessário
        cached_file = cache.get_cached_audio(track_id)
        
        if not cached_file:
            # Download em background
            def download_track():
                yt_url = matcher.spotify_to_youtube(
                    track['name'],
                    track['artists'][0]['name'],
                    track['duration_ms']
                )
                if yt_url:
                    return cache.download_and_cache(yt_url, track_id)
            
            background_tasks.add_task(download_track)
            track_info['file_path'] = f"cache/{track_id}.mp3"  # placeholder
        else:
            track_info['file_path'] = cached_file
        
        player.add_to_queue(track_info)
        
        return {
            "message": "Added to queue",
            "track": track_info,
            "queue_length": len(player.queue)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/queue")
async def get_queue():
    """
    Retorna fila de reprodução
    """
    return {
        "queue": player.get_queue(),
        "length": len(player.queue)
    }

@app.post("/queue/clear")
async def clear_queue():
    """
    Limpa fila de reprodução
    """
    player.clear_queue()
    return {
        "message": "Queue cleared",
        "queue_length": 0
    }

# ========== STATUS & INFO ==========

@app.get("/status")
async def get_status():
    """
    Retorna status completo do player
    """
    return player.get_status()

# ========== PLAYLISTS ==========

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

# ========== CACHE INFO ==========

@app.get("/cache/stats")
async def get_cache_stats():
    """
    Retorna estatísticas do cache
    """
    try:
        stats = cache.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🎵 Starting Spotify YouTube Player API v2.0...")
    print("🔗 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("✨ New features: Auto-play, Shuffle, Repeat, Seek, Enhanced Queue")
    uvicorn.run(app, host="0.0.0.0", port=8000)