import vlc
import threading
import time
import random
from typing import Optional, List, Dict

class AudioPlayer:
    """
    Engine de reprodução de áudio usando VLC com features avançadas:
    - Auto-play de próxima música
    - Shuffle e repeat modes
    - Monitoring thread para playback automático
    - Queue e history management
    - Auto-tracking para UserData
    """
    
    def __init__(self):
        self.vlc_instance = vlc.Instance('--no-xlib')
        self.player = self.vlc_instance.media_player_new()
        
        # Estado do player
        self.current_track = None
        self.queue: List[Dict] = []
        self.history: List[Dict] = []
        self.original_queue: List[Dict] = []  # Para repeat all
        
        # Configurações
        self._volume = 70
        self.player.audio_set_volume(self._volume)
        
        # Modos de reprodução
        self.shuffle_mode = False
        self.repeat_mode = 'off'  # 'off', 'one', 'all'
        
        # UserData integration (será definido externamente)
        self.user_data = None
        
        # Track playback start time
        self.track_start_time = None
        
        # Monitoring thread para auto-play
        self.should_monitor = True
        self.monitor_thread = threading.Thread(
            target=self._monitor_playback,
            daemon=True
        )
        self.monitor_thread.start()
        
        print("AudioPlayer initialized with monitoring thread")
    
    def _monitor_playback(self):
        """
        Thread que monitora o estado do player e auto-play próxima música
        """
        last_state = None
        
        while self.should_monitor:
            try:
                state = self.player.get_state()
                
                # Detectar quando música acaba
                if state == vlc.State.Ended and last_state != vlc.State.Ended:
                    print("Track ended, handling next...")
                    self._handle_track_end(completed=True)
                
                last_state = state
                time.sleep(0.5)  # Checar 2x por segundo
                
            except Exception as e:
                print(f"Monitor error: {e}")
                time.sleep(1)
    
    def _track_to_history(self, completed: bool = True):
        """
        Adiciona track atual ao UserData history
        
        Args:
            completed: Se a música foi ouvida até o fim (>30%)
        """
        if not self.current_track or not self.user_data:
            return
        
        # Verificar se foi ouvida por tempo suficiente
        if not completed and self.track_start_time:
            elapsed = time.time() - self.track_start_time
            duration = self.current_track.get('duration', 0)
            
            if duration > 0:
                play_percentage = (elapsed / duration) * 100
                # Considerar completado se ouviu pelo menos 30%
                completed = play_percentage >= 30
        
        try:
            self.user_data.add_to_history(self.current_track, completed)
            print(f"Added to UserData history: {self.current_track.get('name', 'Unknown')}")
        except Exception as e:
            print(f"Error tracking to history: {e}")
    
    def _handle_track_end(self, completed: bool = True):
        """
        Lógica executada quando música acaba
        
        Args:
            completed: Se a música foi completada
        """
        # Adicionar ao histórico local
        if self.current_track:
            self.history.append(self.current_track)
            print(f"Added to history: {self.current_track.get('name', 'Unknown')}")
            
            # Track to UserData
            self._track_to_history(completed)
        
        # Repeat one - repetir mesma música
        if self.repeat_mode == 'one':
            print("Repeating current track (repeat one mode)")
            self.replay_current()
            return
        
        # Próxima da fila
        if len(self.queue) > 0:
            print(f"Playing next from queue ({len(self.queue)} remaining)")
            self.play_next()
            return
        
        # Repeat all - recomeçar fila do início
        if self.repeat_mode == 'all' and len(self.history) > 0:
            print("Restarting queue (repeat all mode)")
            self.queue = self.original_queue.copy()
            self.history = []
            
            if self.shuffle_mode:
                random.shuffle(self.queue)
                print("Queue reshuffled")
            
            self.play_next()
            return
        
        # Nada mais para tocar
        print("Playback finished - queue empty")
        self.current_track = None
    
    def play(self, file_path: str, track_info: Optional[Dict] = None):
        """
        Reproduz um arquivo de áudio
        
        Args:
            file_path: Caminho do arquivo
            track_info: Metadados da música (opcional)
        """
        try:
            # Se estava tocando outra música, marcar como não completada
            if self.current_track and self.is_playing():
                self._track_to_history(completed=False)
            
            media = self.vlc_instance.media_new(file_path)
            self.player.set_media(media)
            self.player.play()
            
            # Atualizar track atual
            if track_info:
                self.current_track = track_info
            else:
                self.current_track = {'file_path': file_path}
            
            # Marcar início da reprodução
            self.track_start_time = time.time()
            
            # Aguarda um pouco para garantir que começou
            time.sleep(0.1)
            
            print(f"Now playing: {self.current_track.get('name', file_path)}")
            return True
            
        except Exception as e:
            print(f"Error playing audio: {e}")
            return False
    
    def play_next(self):
        """
        Toca próxima música da fila
        
        Returns:
            Dict com info da música ou None se fila vazia
        """
        if len(self.queue) == 0:
            print("Queue is empty, cannot play next")
            return None
        
        next_track = self.queue.pop(0)
        
        # Assumir que file_path está em cache
        file_path = next_track.get('file_path', f"cache/{next_track.get('id', 'unknown')}.mp3")
        
        self.play(file_path, next_track)
        return next_track
    
    def replay_current(self):
        """
        Repete a música atual do início
        """
        if self.current_track:
            file_path = self.current_track.get('file_path', '')
            if file_path:
                self.player.stop()
                time.sleep(0.1)
                # Não marcar como completado ao repetir
                self.track_start_time = time.time()
                self.play(file_path, self.current_track)
    
    def pause(self):
        """
        Pausa reprodução
        """
        if self.is_playing():
            self.player.pause()
            print("Paused")
    
    def resume(self):
        """
        Resume reprodução
        """
        if not self.is_playing():
            self.player.play()
            print("Resumed")
    
    def stop(self):
        """
        Para reprodução
        """
        # Track to history before stopping
        if self.current_track and self.is_playing():
            self._track_to_history(completed=False)
        
        self.player.stop()
        print("Stopped")
    
    def is_playing(self) -> bool:
        """
        Verifica se está tocando
        """
        return self.player.is_playing() == 1
    
    def seek(self, position_seconds: int):
        """
        Pula para uma posição específica
        
        Args:
            position_seconds: Posição em segundos
        """
        position_ms = position_seconds * 1000
        self.player.set_time(position_ms)
        print(f"Seeked to {position_seconds}s")
    
    def get_position(self) -> Dict:
        """
        Retorna posição atual detalhada
        
        Returns:
            Dict com current (s), duration (s), percentage
        """
        if not self.current_track:
            return {
                "current": 0,
                "duration": 0,
                "percentage": 0
            }
        
        current_ms = self.player.get_time()
        duration_ms = self.player.get_length()
        
        if duration_ms <= 0 or current_ms < 0:
            return {"current": 0, "duration": 0, "percentage": 0}
        
        current = current_ms / 1000.0
        duration = duration_ms / 1000.0
        percentage = (current / duration) * 100 if duration > 0 else 0
        
        return {
            "current": round(current, 1),
            "duration": round(duration, 1),
            "percentage": round(percentage, 2)
        }
    
    def get_volume(self) -> int:
        """
        Retorna volume atual (0-100)
        """
        return self._volume
    
    def set_volume(self, volume: int):
        """
        Define volume (0-100)
        """
        if 0 <= volume <= 100:
            self._volume = volume
            self.player.audio_set_volume(volume)
            print(f"Volume set to {volume}%")
    
    def toggle_shuffle(self) -> bool:
        """
        Alterna modo shuffle
        
        Returns:
            Estado atual do shuffle
        """
        self.shuffle_mode = not self.shuffle_mode
        
        if self.shuffle_mode and len(self.queue) > 0:
            random.shuffle(self.queue)
            print("Shuffle ON - queue shuffled")
        else:
            print("Shuffle OFF")
        
        return self.shuffle_mode
    
    def cycle_repeat(self) -> str:
        """
        Alterna entre modos de repeat: off → one → all → off
        
        Returns:
            Modo atual ('off', 'one', 'all')
        """
        modes = ['off', 'one', 'all']
        current_index = modes.index(self.repeat_mode)
        self.repeat_mode = modes[(current_index + 1) % 3]
        
        print(f"Repeat mode: {self.repeat_mode}")
        return self.repeat_mode
    
    def add_to_queue(self, track_info: Dict):
        """
        Adiciona música à fila
        
        Args:
            track_info: Dict com informações da música (id, name, artist, file_path, etc)
        """
        self.queue.append(track_info)
        
        # Salvar queue original para repeat all
        if not self.original_queue:
            self.original_queue = self.queue.copy()
        
        print(f"Added to queue: {track_info.get('name', 'Unknown')} ({len(self.queue)} in queue)")
    
    def get_queue(self) -> List[Dict]:
        """
        Retorna fila de reprodução
        """
        return self.queue
    
    def clear_queue(self):
        """
        Limpa fila de reprodução
        """
        self.queue = []
        self.original_queue = []
        print("Queue cleared")
    
    def get_status(self) -> Dict:
        """
        Retorna status completo do player
        """
        return {
            "current_track": self.current_track,
            "is_playing": self.is_playing(),
            "shuffle": self.shuffle_mode,
            "repeat": self.repeat_mode,
            "queue_length": len(self.queue),
            "history_length": len(self.history),
            "volume": self.get_volume(),
            "position": self.get_position()
        }
    
    def __del__(self):
        """
        Limpa recursos ao destruir objeto
        """
        print("AudioPlayer shutting down...")
        self.should_monitor = False
        
        # Track current song before shutdown
        if self.current_track and self.is_playing():
            self._track_to_history(completed=False)
        
        if hasattr(self, 'monitor_thread') and self.monitor_thread.is_alive():
            self.monitor_thread.join(timeout=2)
        
        if hasattr(self, 'player'):
            self.player.stop()
            self.player.release()
        
        if hasattr(self, 'vlc_instance'):
            self.vlc_instance.release()
        
        print("AudioPlayer shutdown complete")