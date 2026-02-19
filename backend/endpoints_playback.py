# Playback control endpoints
# To be included in main.py

from fastapi import HTTPException

@app.post("/play/{track_id}")
async def play_track(track_id: str, background_tasks: BackgroundTasks):
    """Play a track by Spotify ID"""
    try:
        # Get track info from Spotify
        track = sp.track(track_id)
        
        # Find YouTube video
        youtube_url = matcher.find_youtube_match(
            track['name'],
            track['artists'][0]['name']
        )
        
        if not youtube_url:
            raise HTTPException(status_code=404, detail="No YouTube match found")
        
        # Check cache
        cached_path = cache.get_cached_audio(youtube_url)
        
        if cached_path:
            audio_path = cached_path
        else:
            # Download in background
            audio_path = cache.download_audio(youtube_url)
        
        # Prepare track info
        track_info = {
            'id': track_id,
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'duration': track['duration_ms'],
            'youtube_url': youtube_url
        }
        
        # Play
        player.play(audio_path, track_info)
        
        return {
            "message": "Playing track",
            "track": track_info
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/previous")
async def previous_track():
    """Go to previous track"""
    try:
        result = player.previous()
        
        if result == 'restart':
            return {
                "message": "Restarted current track",
                "action": "restart"
            }
        
        if result and isinstance(result, dict) and 'id' in result:
            # Play the previous track
            track_id = result['id']
            track = sp.track(track_id)
            
            youtube_url = result.get('youtube_url') or matcher.find_youtube_match(
                track['name'],
                track['artists'][0]['name']
            )
            
            cached_path = cache.get_cached_audio(youtube_url)
            if cached_path:
                track_info = {
                    'id': track_id,
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'album': track['album']['name'],
                    'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
                    'duration': track['duration_ms'],
                    'youtube_url': youtube_url
                }
                
                # Don't add to history when going back
                temp_history = player.history.copy()
                player.play(cached_path, track_info)
                player.history = temp_history  # Restore history
                
                return {
                    "message": "Playing previous track",
                    "track": track_info
                }
        
        return {
            "message": "No previous track",
            "action": "none"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/next")
async def next_track():
    """Play next track in queue"""
    try:
        next_id = player.play_next_in_queue()
        
        if not next_id:
            return {"message": "No more tracks in queue"}
        
        # Play the next track
        track = sp.track(next_id)
        youtube_url = matcher.find_youtube_match(
            track['name'],
            track['artists'][0]['name']
        )
        
        cached_path = cache.get_cached_audio(youtube_url)
        if not cached_path:
            cached_path = cache.download_audio(youtube_url)
        
        track_info = {
            'id': next_id,
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'duration': track['duration_ms']
        }
        
        player.play(cached_path, track_info)
        
        return {
            "message": "Playing next track",
            "track": track_info
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pause")
async def pause():
    """Pause playback"""
    player.pause()
    return {"message": "Paused"}

@app.post("/resume")
async def resume():
    """Resume playback"""
    player.resume()
    return {"message": "Resumed"}

@app.post("/stop")
async def stop():
    """Stop playback"""
    player.stop()
    return {"message": "Stopped"}

@app.get("/status")
async def get_status():
    """Get player status"""
    return player.get_status()

@app.get("/position")
async def get_position():
    """Get current position"""
    return {
        "position": player.get_position(),
        "duration": player.get_duration()
    }

@app.post("/seek/{position}")
async def seek(position: int):
    """Seek to position (ms)"""
    player.seek(position)
    return {"position": position}

@app.post("/volume/{level}")
async def set_volume(level: int):
    """Set volume (0-100)"""
    if level < 0 or level > 100:
        raise HTTPException(status_code=400, detail="Volume must be 0-100")
    player.set_volume(level)
    return {"volume": level}
