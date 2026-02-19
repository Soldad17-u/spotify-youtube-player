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
from lyrics_fetcher import LyricsFetcher
from equalizer import Equalizer
from user_data import UserData

load_dotenv()

app = FastAPI(
    title="Spotify YouTube Player API",
    description="Hybrid music player using Spotify metadata + YouTube streaming",
    version="3.0.0"
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
lyrics_fetcher = LyricsFetcher()
equalizer = Equalizer()
user_data = UserData()

# Connect user_data to player for auto-tracking
player.user_data = user_data

class PlayRequest(BaseModel):
    track_id: str

@app.get("/")
async def root():
    return {
        "message": "Spotify YouTube Player API",
        "status": "running",
        "version": "3.0.0",
        "features": [
            "Auto-play next track",
            "Shuffle and repeat modes",
            "Progress tracking & seek",
            "Queue management",
            "Lyrics fetching",
            "3-band Equalizer",
            "History tracking",
            "Favorites system",
            "Statistics"
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
            
            cached_file = cache.download_and_cache(yt_url, track_id)
        
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
    player.pause()
    return {"status": "paused"}

@app.post("/resume")
async def resume():
    player.resume()
    return {"status": "playing"}

@app.post("/stop")
async def stop():
    player.stop()
    return {"status": "stopped"}

@app.post("/next")
async def play_next_track(background_tasks: BackgroundTasks):
    next_track = player.play_next()
    if next_track:
        return {"status": "playing next", "track": next_track}
    else:
        return {"status": "queue empty", "message": "No more tracks in queue"}

# ========== POSITION & SEEKING ==========

@app.get("/position")
async def get_position():
    return player.get_position()

@app.post("/seek/{position}")
async def seek(position: int):
    if position < 0:
        raise HTTPException(status_code=400, detail="Position must be >= 0")
    
    player.seek(position)
    return {"status": "seeked", "position": position, "current_position": player.get_position()}

# ========== SHUFFLE & REPEAT ==========

@app.post("/shuffle/toggle")
async def toggle_shuffle():
    shuffle_on = player.toggle_shuffle()
    return {"shuffle": shuffle_on, "message": f"Shuffle {'enabled' if shuffle_on else 'disabled'}"}

@app.post("/repeat/cycle")
async def cycle_repeat():
    repeat_mode = player.cycle_repeat()
    return {"repeat": repeat_mode, "message": f"Repeat mode: {repeat_mode}"}

# ========== VOLUME ==========

@app.post("/volume/{level}")
async def set_volume(level: int):
    if level < 0 or level > 100:
        raise HTTPException(status_code=400, detail="Volume must be between 0 and 100")
    player.set_volume(level)
    return {"volume": level}

@app.get("/volume")
async def get_volume():
    return {"volume": player.get_volume()}

# ========== EQUALIZER ==========

@app.get("/equalizer")
async def get_equalizer():
    """
    Retorna configurações atuais do equalizer
    """
    return equalizer.get_settings()

@app.post("/equalizer/band/{band}/{value}")
async def set_equalizer_band(band: str, value: float):
    """
    Define valor de uma banda (-12 a +12 dB)
    """
    if value < -12 or value > 12:
        raise HTTPException(status_code=400, detail="Value must be between -12 and 12")
    
    if band not in ['bass', 'mid', 'treble']:
        raise HTTPException(status_code=400, detail="Band must be bass, mid, or treble")
    
    success = equalizer.set_band(band, value)
    if success:
        return {"message": f"{band} set to {value}dB", "settings": equalizer.get_settings()}
    else:
        raise HTTPException(status_code=500, detail="Failed to set band")

@app.post("/equalizer/preset/{preset}")
async def load_equalizer_preset(preset: str):
    """
    Carrega um preset do equalizer
    """
    success = equalizer.load_preset(preset)
    if success:
        return {"message": f"Loaded preset: {preset}", "settings": equalizer.get_settings()}
    else:
        raise HTTPException(status_code=404, detail="Preset not found")

@app.get("/equalizer/presets")
async def get_equalizer_presets():
    """
    Lista todos os presets disponíveis
    """
    return {"presets": equalizer.get_presets()}

@app.post("/equalizer/toggle")
async def toggle_equalizer():
    """
    Liga/desliga equalizer
    """
    enabled = equalizer.toggle_enabled()
    return {"enabled": enabled, "message": f"Equalizer {'enabled' if enabled else 'disabled'}"}

# ========== HISTORY ==========

@app.get("/history")
async def get_history(limit: int = 50, offset: int = 0):
    """
    Retorna histórico de reprodução
    """
    history = user_data.get_history(limit, offset)
    return {"history": history, "count": len(history)}

@app.get("/history/recent")
async def get_recent_tracks(limit: int = 20):
    """
    Retorna músicas tocadas recentemente (sem duplicatas)
    """
    recent = user_data.get_recent_tracks(limit)
    return {"tracks": recent, "count": len(recent)}

@app.get("/history/most-played")
async def get_most_played(limit: int = 20):
    """
    Retorna músicas mais tocadas
    """
    most_played = user_data.get_most_played(limit)
    return {"tracks": most_played, "count": len(most_played)}

@app.delete("/history")
async def clear_history(older_than_days: int = None):
    """
    Limpa histórico
    """
    user_data.clear_history(older_than_days)
    return {"message": "History cleared"}

# ========== FAVORITES ==========

@app.get("/favorites")
async def get_favorites(limit: int = 100, offset: int = 0):
    """
    Retorna lista de favoritos
    """
    favorites = user_data.get_favorites(limit, offset)
    return {"favorites": favorites, "count": len(favorites), "total": user_data.get_favorites_count()}

@app.post("/favorites/{track_id}")
async def add_favorite(track_id: str):
    """
    Adiciona música aos favoritos
    """
    try:
        track = sp.track(track_id)
        
        track_info = {
            'id': track['id'],
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'duration': track['duration_ms'] / 1000
        }
        
        success = user_data.add_favorite(track_info)
        
        if success:
            return {"message": "Added to favorites", "track": track_info}
        else:
            raise HTTPException(status_code=409, detail="Already in favorites")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/favorites/{track_id}")
async def remove_favorite(track_id: str):
    """
    Remove música dos favoritos
    """
    success = user_data.remove_favorite(track_id)
    
    if success:
        return {"message": "Removed from favorites"}
    else:
        raise HTTPException(status_code=404, detail="Not in favorites")

@app.get("/favorites/check/{track_id}")
async def check_favorite(track_id: str):
    """
    Verifica se música está nos favoritos
    """
    is_fav = user_data.is_favorite(track_id)
    return {"is_favorite": is_fav, "track_id": track_id}

# ========== STATISTICS ==========

@app.get("/statistics")
async def get_statistics():
    """
    Retorna estatísticas de uso
    """
    stats = user_data.get_statistics()
    return stats

# ========== LYRICS ==========

@app.get("/lyrics/{track_id}")
async def get_lyrics(track_id: str):
    try:
        track = sp.track(track_id)
        artist = track['artists'][0]['name']
        title = track['name']
        
        lyrics = lyrics_fetcher.get_lyrics(artist, title)
        
        if lyrics:
            formatted = lyrics_fetcher.format_lyrics_for_display(lyrics)
            return {"found": True, "artist": artist, "title": title, "lyrics": lyrics, "formatted": formatted}
        else:
            return {"found": False, "artist": artist, "title": title, "message": "Lyrics not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== QUEUE MANAGEMENT ==========

@app.post("/queue/add/{track_id}")
async def add_to_queue(track_id: str, background_tasks: BackgroundTasks):
    try:
        track = sp.track(track_id)
        
        track_info = {
            'id': track['id'],
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'duration': track['duration_ms'] / 1000
        }
        
        cached_file = cache.get_cached_audio(track_id)
        
        if not cached_file:
            def download_track():
                yt_url = matcher.spotify_to_youtube(track['name'], track['artists'][0]['name'], track['duration_ms'])
                if yt_url:
                    return cache.download_and_cache(yt_url, track_id)
            
            background_tasks.add_task(download_track)
            track_info['file_path'] = f"cache/{track_id}.mp3"
        else:
            track_info['file_path'] = cached_file
        
        player.add_to_queue(track_info)
        
        return {"message": "Added to queue", "track": track_info, "queue_length": len(player.queue)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/queue")
async def get_queue():
    return {"queue": player.get_queue(), "length": len(player.queue)}

@app.post("/queue/clear")
async def clear_queue():
    player.clear_queue()
    return {"message": "Queue cleared", "queue_length": 0}

# ========== STATUS & INFO ==========

@app.get("/status")
async def get_status():
    return player.get_status()

# ========== PLAYLISTS ==========

@app.get("/playlists")
async def get_playlists(limit: int = 50):
    try:
        playlists = sp.current_user_playlists(limit=limit)
        return {"playlists": playlists['items']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/playlist/{playlist_id}")
async def get_playlist_tracks(playlist_id: str):
    try:
        results = sp.playlist_tracks(playlist_id)
        tracks = [item['track'] for item in results['items'] if item['track']]
        return {"tracks": tracks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== CACHE INFO ==========

@app.get("/cache/stats")
async def get_cache_stats():
    try:
        stats = cache.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🎵 Starting Spotify YouTube Player API v3.0...")
    print("🔗 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("✨ NEW: Equalizer, History, Favorites, Statistics")
    uvicorn.run(app, host="0.0.0.0", port=8000)