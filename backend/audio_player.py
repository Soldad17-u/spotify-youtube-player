import vlc
from typing import Optional, List
import time

class AudioPlayer:
    """
    Engine de reprodução de áudio usando VLC
    """
    
    def __init__(self):
        self.vlc_instance = vlc.Instance('--no-xlib')
        self.player = self.vlc_instance.media_player_new()
        self.current_track = None
        self.queue: List[str] = []
        self._volume = 70
        self.player.audio_set_volume(self._volume)
    
    def play(self, file_path: str):
        """
        Reproduz um arquivo de áudio
        
        Args:
            file_path: Caminho do arquivo
        """
        try:
            media = self.vlc_instance.media_new(file_path)
            self.player.set_media(media)
            self.player.play()
            self.current_track = file_path
            
            # Aguarda um pouco para garantir que começou
            time.sleep(0.1)
            
        except Exception as e:
            print(f"Error playing audio: {e}")
            raise
    
    def pause(self):
        """
        Pausa reprodução
        """
        if self.is_playing():
            self.player.pause()
    
    def resume(self):
        """
        Resume reprodução
        """
        if not self.is_playing():
            self.player.play()
    
    def stop(self):
        """
        Para reprodução
        """
        self.player.stop()
        self.current_track = None
    
    def is_playing(self) -> bool:
        """
        Verifica se está tocando
        """
        return self.player.is_playing() == 1
    
    def get_position(self) -> float:
        """
        Retorna posição atual (0.0 a 1.0)
        """
        return self.player.get_position()
    
    def set_position(self, position: float):
        """
        Define posição (0.0 a 1.0)
        """
        self.player.set_position(position)
    
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
    
    def get_time(self) -> int:
        """
        Retorna tempo atual em milissegundos
        """
        return self.player.get_time()
    
    def get_length(self) -> int:
        """
        Retorna duração total em milissegundos
        """
        return self.player.get_length()
    
    def add_to_queue(self, track_id: str):
        """
        Adiciona música à fila
        """
        self.queue.append(track_id)
    
    def next_track(self) -> Optional[str]:
        """
        Retorna próxima música da fila
        """
        if self.queue:
            return self.queue.pop(0)
        return None
    
    def clear_queue(self):
        """
        Limpa fila de reprodução
        """
        self.queue = []
    
    def __del__(self):
        """
        Limpa recursos ao destruir objeto
        """
        if hasattr(self, 'player'):
            self.player.stop()
            self.player.release()
        if hasattr(self, 'vlc_instance'):
            self.vlc_instance.release()