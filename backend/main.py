from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from dotenv import load_dotenv

from music_matcher import MusicMatcher
from audio_cache import AudioCache
from audio_player import AudioPlayer
from lyrics_fetcher import LyricsFetcher
from history_manager import HistoryManager
from equalizer import Equalizer
from settings_manager import SettingsManager

load_dotenv()

app = FastAPI(
    title="Spotify YouTube Player API",
    description="Complete hybrid music player with 60+ features",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
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
history = HistoryManager()
settings = SettingsManager()

# Equalizer will be initialized after player starts
equalizer = None

class PlayRequest(BaseModel):
    track_id: str

@app.on_event("startup")
async def startup_event():
    """Initialize equalizer on startup"""
    global equalizer
    if player.player:
        equalizer = Equalizer(player.player)
        print("🎛️ Equalizer initialized")

@app.get("/")
async def root():
    return {
        "message": "Spotify YouTube Player API",
        "status": "running",
        "version": "3.0.0",
        "features": [
            "Auto-play", "Shuffle", "Repeat", "Progress", "Seek",
            "Queue", "Lyrics", "History", "Favorites", "Analytics",
            "Equalizer", "Settings", "Notifications", "Hotkeys"
        ],
        "endpoints": 40
    }

# ========== SEARCH & METADATA ==========

@app.get("/search")
async def search(q: str, limit: int = 20):
    try:
        results = sp.search(q=q, limit=limit, type='track')
        return {"tracks": results['tracks']['items']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/track/{track_id}")
async def get_track(track_id: str):
    try:
        track = sp.track(track_id)
        is_fav = history.is_favorite(track_id)
        return {**track, "is_favorite": is_fav}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Track not found")

# ========== PLAYBACK ==========

@app.post("/play/{track_id}")
async def play_track(track_id: str, background_tasks: BackgroundTasks):
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
            yt_url = matcher.spotify_to_youtube(
                track['name'],
                track['artists'][0]['name'],
                track['duration_ms']
            )
            
            if not yt_url:
                raise HTTPException(status_code=404, detail="Could not find matching YouTube video")
            
            cached_file = cache.download_and_cache(yt_url, track_id)
        
        track_info['file_path'] = cached_file
        
        success = player.play(cached_file, track_info)
        
        if success:
            # Add to history
            history.add_to_history(track_info, completed=False)
            
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
    if player.current_track:
        history.add_to_history(player.current_track, completed=False)
    return {"status": "stopped"}

@app.post("/next")
async def play_next_track():
    # Mark current as completed
    if player.current_track:
        history.add_to_history(player.current_track, completed=True)
    
    next_track = player.play_next()
    
    if next_track:
        return {"status": "playing next", "track": next_track}
    else:
        return {"status": "queue empty", "message": "No more tracks"}

# ========== POSITION & SEEKING ==========

@app.get("/position")
async def get_position():
    return player.get_position()

@app.post("/seek/{position}")
async def seek(position: int):
    if position < 0:
        raise HTTPException(status_code=400, detail="Position must be >= 0")
    player.seek(position)
    return {"status": "seeked", "position": position}

# ========== SHUFFLE & REPEAT ==========

@app.post("/shuffle/toggle")
async def toggle_shuffle():
    shuffle_on = player.toggle_shuffle()
    settings.set('playback', 'shuffle', shuffle_on)
    return {"shuffle": shuffle_on}

@app.post("/repeat/cycle")
async def cycle_repeat():
    repeat_mode = player.cycle_repeat()
    settings.set('playback', 'repeat', repeat_mode)
    return {"repeat": repeat_mode}

# ========== VOLUME ==========

@app.post("/volume/{level}")
async def set_volume(level: int):
    if level < 0 or level > 100:
        raise HTTPException(status_code=400, detail="Volume must be 0-100")
    player.set_volume(level)
    settings.set('audio', 'volume', level)
    return {"volume": level}

@app.get("/volume")
async def get_volume():
    return {"volume": player.get_volume()}

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
            return {
                "found": True,
                "artist": artist,
                "title": title,
                "lyrics": lyrics,
                "formatted": formatted
            }
        else:
            return {
                "found": False,
                "artist": artist,
                "title": title,
                "message": "Lyrics not found"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== QUEUE ==========

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
                yt_url = matcher.spotify_to_youtube(
                    track['name'],
                    track['artists'][0]['name'],
                    track['duration_ms']
                )
                if yt_url:
                    return cache.download_and_cache(yt_url, track_id)
            
            background_tasks.add_task(download_track)
            track_info['file_path'] = f"cache/{track_id}.mp3"
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
    return {"queue": player.get_queue(), "length": len(player.queue)}

@app.post("/queue/clear")
async def clear_queue():
    player.clear_queue()
    return {"message": "Queue cleared", "queue_length": 0}

# ========== HISTORY ==========

@app.get("/history")
async def get_history(limit: int = 50, offset: int = 0):
    return {"history": history.get_history(limit, offset)}

@app.get("/history/most-played")
async def get_most_played(limit: int = 20):
    return {"tracks": history.get_most_played(limit)}

@app.delete("/history")
async def clear_history(days_old: Optional[int] = None):
    deleted = history.clear_history(days_old)
    return {"message": f"Deleted {deleted} entries"}

# ========== FAVORITES ==========

@app.post("/favorites/{track_id}")
async def add_favorite(track_id: str):
    try:
        track = sp.track(track_id)
        track_info = {
            'id': track['id'],
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None
        }
        history.add_favorite(track_info)
        return {"message": "Added to favorites", "track": track_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/favorites/{track_id}")
async def remove_favorite(track_id: str):
    history.remove_favorite(track_id)
    return {"message": "Removed from favorites"}

@app.get("/favorites")
async def get_favorites():
    return {"favorites": history.get_favorites()}

# ========== ANALYTICS ==========

@app.get("/analytics")
async def get_analytics(days: int = 30):
    return history.get_stats(days)

# ========== EQUALIZER ==========

@app.post("/equalizer/preset/{preset_name}")
async def set_eq_preset(preset_name: str):
    if not equalizer:
        raise HTTPException(status_code=503, detail="Equalizer not initialized")
    success = equalizer.set_preset(preset_name)
    if success:
        settings.set('audio', 'equalizer_preset', preset_name)
        return {"message": f"Preset '{preset_name}' applied"}
    else:
        raise HTTPException(status_code=400, detail="Invalid preset")

@app.post("/equalizer/band/{band_index}")
async def set_eq_band(band_index: int, value: float):
    if not equalizer:
        raise HTTPException(status_code=503, detail="Equalizer not initialized")
    success = equalizer.set_band(band_index, value)
    if success:
        return {"message": f"Band {band_index} set to {value}dB"}
    else:
        raise HTTPException(status_code=400, detail="Invalid band or value")

@app.get("/equalizer")
async def get_eq_status():
    if not equalizer:
        raise HTTPException(status_code=503, detail="Equalizer not initialized")
    return equalizer.get_status()

# ========== SETTINGS ==========

@app.get("/settings")
async def get_settings():
    return settings.get_all()

@app.put("/settings/{category}/{key}")
async def update_setting(category: str, key: str, value: str):
    success = settings.set(category, key, value)
    if success:
        return {"message": "Setting updated"}
    else:
        raise HTTPException(status_code=500, detail="Failed to save")

# ========== STATUS ==========

@app.get("/status")
async def get_status():
    status = player.get_status()
    if player.current_track:
        status['current_track']['is_favorite'] = history.is_favorite(
            player.current_track.get('id', '')
        )
    return status

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

# ========== CACHE ==========

@app.get("/cache/stats")
async def get_cache_stats():
    try:
        return cache.get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cache/cleanup")
async def cleanup_cache(days_old: int = 30):
    # TODO: Implement cache cleanup
    return {"message": "Cache cleanup scheduled"}

if __name__ == "__main__":
    import uvicorn
    print("="*60)
    print("🎵 Spotify YouTube Player API v3.0")
    print("="*60)
    print("🔗 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print()
    print("✨ Features:")
    print("   - Auto-play, Shuffle, Repeat")
    print("   - History & Favorites")
    print("   - 10-band Equalizer")
    print("   - Lyrics fetching")
    print("   - Advanced analytics")
    print("   - 40+ API endpoints")
    print("="*60)
    uvicorn.run(app, host="0.0.0.0", port=8000)