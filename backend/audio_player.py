import vlc
import time
import os
from typing import Optional

class AudioPlayer:
    def __init__(self):
        self.instance = vlc.Instance()
        self.player = self.instance.media_player_new()
        self.current_track = None
        self.is_playing = False
        self.queue = []
        self.queue_index = -1
        self.shuffle = False
        self.repeat = "off"  # off, all, one
        self.user_data = None
        self.history = []  # Track history for previous functionality
        self.max_history = 50  # Keep last 50 tracks
        
    def play(self, audio_path: str, track_info: dict):
        """Play audio file"""
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        # Add current track to history before playing new one
        if self.current_track:
            self.history.append(self.current_track.copy())
            # Limit history size
            if len(self.history) > self.max_history:
                self.history.pop(0)
        
        media = self.instance.media_new(audio_path)
        self.player.set_media(media)
        self.player.play()
        
        self.current_track = track_info
        self.is_playing = True
        
        # Log to user data
        if self.user_data:
            self.user_data.add_to_history(
                track_info['id'],
                track_info['name'],
                track_info['artist'],
                track_info.get('album', ''),
                track_info.get('duration', 0)
            )
    
    def previous(self):
        """Go to previous track"""
        # If we have history, play the last track
        if self.history:
            prev_track = self.history.pop()
            return prev_track
        
        # If no history but we're in a queue, go back in queue
        if self.queue and self.queue_index > 0:
            self.queue_index -= 1
            return {'id': self.queue[self.queue_index]}
        
        # If at beginning of track (< 3 seconds), go to previous
        # Otherwise, restart current track
        if self.get_position() < 3000:  # 3 seconds
            return None  # Signal to find previous track in queue
        else:
            # Restart current track
            self.seek(0)
            return 'restart'
    
    def pause(self):
        """Pause playback"""
        self.player.pause()
        self.is_playing = False
    
    def resume(self):
        """Resume playback"""
        self.player.play()
        self.is_playing = True
    
    def stop(self):
        """Stop playback"""
        self.player.stop()
        self.is_playing = False
        self.current_track = None
    
    def get_position(self) -> int:
        """Get current position in milliseconds"""
        return self.player.get_time()
    
    def get_duration(self) -> int:
        """Get total duration in milliseconds"""
        return self.player.get_length()
    
    def seek(self, position_ms: int):
        """Seek to position in milliseconds"""
        self.player.set_time(position_ms)
    
    def set_volume(self, volume: int):
        """Set volume (0-100)"""
        self.player.audio_set_volume(volume)
    
    def get_volume(self) -> int:
        """Get current volume"""
        return self.player.audio_get_volume()
    
    def add_to_queue(self, track_id: str):
        """Add track to queue"""
        self.queue.append(track_id)
    
    def get_queue(self):
        """Get current queue"""
        return self.queue.copy()
    
    def clear_queue(self):
        """Clear queue"""
        self.queue.clear()
        self.queue_index = -1
    
    def play_next_in_queue(self):
        """Get next track from queue based on shuffle/repeat"""
        if not self.queue:
            return None
        
        # Handle repeat one
        if self.repeat == "one":
            return self.queue[self.queue_index] if self.queue_index >= 0 else None
        
        # Get next track
        if self.shuffle:
            import random
            next_index = random.randint(0, len(self.queue) - 1)
        else:
            next_index = self.queue_index + 1
        
        # Handle end of queue
        if next_index >= len(self.queue):
            if self.repeat == "all":
                next_index = 0
            else:
                return None
        
        self.queue_index = next_index
        return self.queue[next_index]
    
    def toggle_shuffle(self):
        """Toggle shuffle mode"""
        self.shuffle = not self.shuffle
        return self.shuffle
    
    def cycle_repeat(self):
        """Cycle through repeat modes"""
        modes = ["off", "all", "one"]
        current_index = modes.index(self.repeat)
        next_index = (current_index + 1) % len(modes)
        self.repeat = modes[next_index]
        return self.repeat
    
    def get_status(self):
        """Get player status"""
        return {
            "is_playing": self.is_playing,
            "current_track": self.current_track,
            "position": self.get_position(),
            "duration": self.get_duration(),
            "volume": self.get_volume(),
            "shuffle": self.shuffle,
            "repeat": self.repeat,
            "queue_length": len(self.queue),
            "has_previous": len(self.history) > 0 or self.queue_index > 0
        }
