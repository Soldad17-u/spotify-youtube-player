import os
import sqlite3
import yt_dlp
import threading
import time
from pathlib import Path
from typing import Optional, Callable, Dict

class AudioCache:
    """
    Sistema de cache para arquivos de áudio com suporte a streaming progressivo
    """
    
    def __init__(self, cache_dir: str = "../cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        self.db_path = self.cache_dir / "cache.db"
        self.db = sqlite3.connect(self.db_path, check_same_thread=False)
        self._init_db()
        
        # Tracking de downloads progressivos
        self.progressive_downloads: Dict[str, Dict] = {}
        self.download_lock = threading.Lock()
    
    def _init_db(self):
        """
        Inicializa banco de dados SQLite
        """
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS cache (
                spotify_id TEXT PRIMARY KEY,
                youtube_url TEXT NOT NULL,
                file_path TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_size INTEGER,
                duration_ms INTEGER,
                download_complete BOOLEAN DEFAULT 0
            )
        """)
        self.db.commit()
    
    def get_cached_audio(self, spotify_id: str) -> Optional[str]:
        """
        Busca arquivo de áudio no cache
        
        Args:
            spotify_id: ID da música no Spotify
        
        Returns:
            Caminho do arquivo ou None se não existir
        """
        cursor = self.db.execute(
            "SELECT file_path, download_complete FROM cache WHERE spotify_id = ?",
            (spotify_id,)
        )
        
        result = cursor.fetchone()
        
        if result and os.path.exists(result[0]):
            # Retorna mesmo se download não estiver completo (streaming)
            return result[0]
        
        # Se registro existe mas arquivo não, remove do banco
        if result:
            self.db.execute("DELETE FROM cache WHERE spotify_id = ?", (spotify_id,))
            self.db.commit()
        
        return None
    
    def download_and_cache(self, youtube_url: str, spotify_id: str) -> str:
        """
        Baixa áudio do YouTube e armazena em cache (modo tradicional)
        
        Args:
            youtube_url: URL do vídeo no YouTube
            spotify_id: ID da música no Spotify
        
        Returns:
            Caminho do arquivo baixado
        """
        output_template = str(self.cache_dir / f"{spotify_id}.%(ext)s")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_template,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'opus',
                'preferredquality': '192',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=True)
                
                # Caminho final do arquivo
                file_path = str(self.cache_dir / f"{spotify_id}.opus")
                
                # Salva no banco
                self.db.execute("""
                    INSERT OR REPLACE INTO cache (spotify_id, youtube_url, file_path, file_size, duration_ms, download_complete)
                    VALUES (?, ?, ?, ?, ?, 1)
                """, (
                    spotify_id,
                    youtube_url,
                    file_path,
                    os.path.getsize(file_path) if os.path.exists(file_path) else 0,
                    info.get('duration', 0) * 1000
                ))
                self.db.commit()
                
                return file_path
        
        except Exception as e:
            print(f"Error downloading audio: {e}")
            raise
    
    def download_progressive(
        self,
        youtube_url: str,
        spotify_id: str,
        playback_ready_callback: Optional[Callable] = None,
        min_buffer_percent: float = 10.0
    ) -> str:
        """
        Baixa áudio com streaming progressivo
        
        Inicia playback quando min_buffer_percent% foi baixado,
        continua download em background
        
        Args:
            youtube_url: URL do vídeo
            spotify_id: ID da música
            playback_ready_callback: Função chamada quando pronto para tocar
            min_buffer_percent: % mínima para iniciar playback (default 10%)
        
        Returns:
            Caminho do arquivo (mesmo que incompleto)
        """
        file_path = str(self.cache_dir / f"{spotify_id}.opus")
        
        # Inicializar tracking
        with self.download_lock:
            self.progressive_downloads[spotify_id] = {
                'file_path': file_path,
                'progress': 0,
                'complete': False,
                'ready_for_playback': False,
                'total_size': 0,
                'downloaded_size': 0
            }
        
        # Hook de progresso do yt-dlp
        def progress_hook(d):
            if d['status'] == 'downloading':
                downloaded = d.get('downloaded_bytes', 0)
                total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
                
                if total > 0:
                    progress = (downloaded / total) * 100
                    
                    with self.download_lock:
                        self.progressive_downloads[spotify_id]['progress'] = progress
                        self.progressive_downloads[spotify_id]['downloaded_size'] = downloaded
                        self.progressive_downloads[spotify_id]['total_size'] = total
                        
                        # Callback quando buffer mínimo atingido
                        if progress >= min_buffer_percent and not self.progressive_downloads[spotify_id]['ready_for_playback']:
                            self.progressive_downloads[spotify_id]['ready_for_playback'] = True
                            print(f"✅ Ready for playback: {progress:.1f}% buffered")
                            
                            if playback_ready_callback:
                                playback_ready_callback(file_path)
            
            elif d['status'] == 'finished':
                print(f"✅ Download complete: {spotify_id}")
                with self.download_lock:
                    self.progressive_downloads[spotify_id]['complete'] = True
                    self.progressive_downloads[spotify_id]['progress'] = 100
        
        output_template = str(self.cache_dir / f"{spotify_id}.%(ext)s")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_template,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'opus',
                'preferredquality': '192',
            }],
            'progress_hooks': [progress_hook],
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            # Download em thread separada
            def download_worker():
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(youtube_url, download=True)
                    
                    # Salvar no banco após completar
                    self.db.execute("""
                        INSERT OR REPLACE INTO cache (spotify_id, youtube_url, file_path, file_size, duration_ms, download_complete)
                        VALUES (?, ?, ?, ?, ?, 1)
                    """, (
                        spotify_id,
                        youtube_url,
                        file_path,
                        os.path.getsize(file_path) if os.path.exists(file_path) else 0,
                        info.get('duration', 0) * 1000
                    ))
                    self.db.commit()
            
            # Iniciar download em background
            thread = threading.Thread(target=download_worker, daemon=True)
            thread.start()
            
            # Esperar buffer mínimo
            timeout = 30  # 30 segundos timeout
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                with self.download_lock:
                    if self.progressive_downloads[spotify_id]['ready_for_playback']:
                        break
                time.sleep(0.1)
            
            # Registrar no banco (mesmo que incompleto)
            if os.path.exists(file_path):
                self.db.execute("""
                    INSERT OR REPLACE INTO cache (spotify_id, youtube_url, file_path, file_size, duration_ms, download_complete)
                    VALUES (?, ?, ?, ?, ?, 0)
                """, (
                    spotify_id,
                    youtube_url,
                    file_path,
                    os.path.getsize(file_path),
                    0  # Duration desconhecido ainda
                ))
                self.db.commit()
            
            return file_path
        
        except Exception as e:
            print(f"Error in progressive download: {e}")
            raise
    
    def is_playback_ready(self, spotify_id: str) -> bool:
        """
        Verifica se arquivo está pronto para playback
        
        Args:
            spotify_id: ID da música
        
        Returns:
            True se pode começar a tocar
        """
        with self.download_lock:
            if spotify_id in self.progressive_downloads:
                return self.progressive_downloads[spotify_id]['ready_for_playback']
        
        # Se não está em download progressivo, verificar se existe completo
        return self.get_cached_audio(spotify_id) is not None
    
    def get_download_progress(self, spotify_id: str) -> Optional[Dict]:
        """
        Retorna progresso de download progressivo
        
        Args:
            spotify_id: ID da música
        
        Returns:
            Dict com progress, complete, ready_for_playback
        """
        with self.download_lock:
            return self.progressive_downloads.get(spotify_id)
    
    def get_stats(self) -> dict:
        """
        Retorna estatísticas do cache (alias para get_cache_stats)
        """
        return self.get_cache_stats()
    
    def get_cache_stats(self) -> dict:
        """
        Retorna estatísticas do cache
        """
        cursor = self.db.execute("""
            SELECT COUNT(*), SUM(file_size), SUM(duration_ms), 
                   COUNT(CASE WHEN download_complete = 1 THEN 1 END)
            FROM cache
        """)
        
        count, total_size, total_duration, complete_count = cursor.fetchone()
        
        # Downloads progressivos ativos
        active_downloads = 0
        with self.download_lock:
            active_downloads = len([d for d in self.progressive_downloads.values() if not d['complete']])
        
        return {
            'total_tracks': count or 0,
            'complete_tracks': complete_count or 0,
            'total_size_mb': (total_size or 0) / (1024 * 1024),
            'total_duration_hours': (total_duration or 0) / (1000 * 60 * 60),
            'active_downloads': active_downloads
        }
    
    def clear_cache(self):
        """
        Limpa todo o cache
        """
        # Remove arquivos
        for file in self.cache_dir.glob("*.opus"):
            try:
                file.unlink()
            except Exception as e:
                print(f"Error deleting {file}: {e}")
        
        # Limpa banco
        self.db.execute("DELETE FROM cache")
        self.db.commit()
        
        # Limpa tracking
        with self.download_lock:
            self.progressive_downloads.clear()
    
    def remove_from_cache(self, spotify_id: str):
        """
        Remove música específica do cache
        """
        cursor = self.db.execute(
            "SELECT file_path FROM cache WHERE spotify_id = ?",
            (spotify_id,)
        )
        
        result = cursor.fetchone()
        
        if result:
            file_path = result[0]
            
            # Remove arquivo
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Remove do banco
            self.db.execute("DELETE FROM cache WHERE spotify_id = ?", (spotify_id,))
            self.db.commit()
        
        # Remove tracking
        with self.download_lock:
            if spotify_id in self.progressive_downloads:
                del self.progressive_downloads[spotify_id]
    
    def __del__(self):
        """
        Fecha conexão com banco ao destruir objeto
        """
        if hasattr(self, 'db'):
            self.db.close()