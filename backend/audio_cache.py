import os
import sqlite3
import yt_dlp
from pathlib import Path
from typing import Optional

class AudioCache:
    """
    Sistema de cache para arquivos de áudio
    """
    
    def __init__(self, cache_dir: str = "../cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        self.db_path = self.cache_dir / "cache.db"
        self.db = sqlite3.connect(self.db_path, check_same_thread=False)
        self._init_db()
    
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
                duration_ms INTEGER
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
            "SELECT file_path FROM cache WHERE spotify_id = ?",
            (spotify_id,)
        )
        
        result = cursor.fetchone()
        
        if result and os.path.exists(result[0]):
            return result[0]
        
        # Se registro existe mas arquivo não, remove do banco
        if result:
            self.db.execute("DELETE FROM cache WHERE spotify_id = ?", (spotify_id,))
            self.db.commit()
        
        return None
    
    def download_and_cache(self, youtube_url: str, spotify_id: str) -> str:
        """
        Baixa áudio do YouTube e armazena em cache
        
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
                    INSERT OR REPLACE INTO cache (spotify_id, youtube_url, file_path, file_size, duration_ms)
                    VALUES (?, ?, ?, ?, ?)
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
    
    def get_cache_stats(self) -> dict:
        """
        Retorna estatísticas do cache
        """
        cursor = self.db.execute("""
            SELECT COUNT(*), SUM(file_size), SUM(duration_ms)
            FROM cache
        """)
        
        count, total_size, total_duration = cursor.fetchone()
        
        return {
            'total_tracks': count or 0,
            'total_size_mb': (total_size or 0) / (1024 * 1024),
            'total_duration_hours': (total_duration or 0) / (1000 * 60 * 60)
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
    
    def __del__(self):
        """
        Fecha conexão com banco ao destruir objeto
        """
        if hasattr(self, 'db'):
            self.db.close()