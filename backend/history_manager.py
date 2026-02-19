import sqlite3
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

class HistoryManager:
    """
    Gerencia histórico de reprodução e favoritos
    """
    
    def __init__(self, db_path: str = "cache/history.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Inicializa tabelas do banco"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabela de histórico
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                track_id TEXT NOT NULL,
                track_name TEXT,
                artist TEXT,
                album TEXT,
                duration REAL,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed BOOLEAN DEFAULT 0
            )
        """)
        
        # Tabela de favoritos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                track_id TEXT PRIMARY KEY,
                track_name TEXT,
                artist TEXT,
                album TEXT,
                album_art TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabela de estatísticas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stats (
                date TEXT PRIMARY KEY,
                total_plays INTEGER DEFAULT 0,
                total_time REAL DEFAULT 0,
                unique_tracks INTEGER DEFAULT 0
            )
        """)
        
        conn.commit()
        conn.close()
    
    def add_to_history(self, track_info: Dict, completed: bool = True):
        """Adiciona música ao histórico"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO history (track_id, track_name, artist, album, duration, completed)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            track_info.get('id'),
            track_info.get('name'),
            track_info.get('artist'),
            track_info.get('album'),
            track_info.get('duration', 0),
            completed
        ))
        
        conn.commit()
        conn.close()
    
    def get_history(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Retorna histórico de reprodução"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT track_id, track_name, artist, album, duration, played_at, completed
            FROM history
            ORDER BY played_at DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{
            'track_id': row[0],
            'name': row[1],
            'artist': row[2],
            'album': row[3],
            'duration': row[4],
            'played_at': row[5],
            'completed': bool(row[6])
        } for row in rows]
    
    def add_favorite(self, track_info: Dict):
        """Adiciona música aos favoritos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO favorites (track_id, track_name, artist, album, album_art)
            VALUES (?, ?, ?, ?, ?)
        """, (
            track_info.get('id'),
            track_info.get('name'),
            track_info.get('artist'),
            track_info.get('album'),
            track_info.get('album_art')
        ))
        
        conn.commit()
        conn.close()
    
    def remove_favorite(self, track_id: str):
        """Remove música dos favoritos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM favorites WHERE track_id = ?", (track_id,))
        conn.commit()
        conn.close()
    
    def get_favorites(self) -> List[Dict]:
        """Retorna todas as músicas favoritas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT track_id, track_name, artist, album, album_art, added_at
            FROM favorites
            ORDER BY added_at DESC
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{
            'id': row[0],
            'name': row[1],
            'artist': row[2],
            'album': row[3],
            'album_art': row[4],
            'added_at': row[5]
        } for row in rows]
    
    def is_favorite(self, track_id: str) -> bool:
        """Verifica se música é favorita"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM favorites WHERE track_id = ?", (track_id,))
        result = cursor.fetchone()
        conn.close()
        return result is not None
    
    def get_most_played(self, limit: int = 20) -> List[Dict]:
        """Retorna músicas mais tocadas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT track_id, track_name, artist, album, COUNT(*) as play_count
            FROM history
            WHERE completed = 1
            GROUP BY track_id
            ORDER BY play_count DESC
            LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{
            'id': row[0],
            'name': row[1],
            'artist': row[2],
            'album': row[3],
            'play_count': row[4]
        } for row in rows]
    
    def get_stats(self, days: int = 30) -> Dict:
        """Retorna estatísticas de uso"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Total de plays
        cursor.execute(
            "SELECT COUNT(*) FROM history WHERE played_at > ?",
            (since,)
        )
        total_plays = cursor.fetchone()[0]
        
        # Tempo total
        cursor.execute(
            "SELECT SUM(duration) FROM history WHERE played_at > ? AND completed = 1",
            (since,)
        )
        total_time = cursor.fetchone()[0] or 0
        
        # Músicas únicas
        cursor.execute(
            "SELECT COUNT(DISTINCT track_id) FROM history WHERE played_at > ?",
            (since,)
        )
        unique_tracks = cursor.fetchone()[0]
        
        # Artistas mais ouvidos
        cursor.execute("""
            SELECT artist, COUNT(*) as count
            FROM history
            WHERE played_at > ?
            GROUP BY artist
            ORDER BY count DESC
            LIMIT 10
        """, (since,))
        top_artists = [{'artist': row[0], 'plays': row[1]} for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'period_days': days,
            'total_plays': total_plays,
            'total_time_seconds': total_time,
            'total_time_hours': round(total_time / 3600, 1),
            'unique_tracks': unique_tracks,
            'top_artists': top_artists,
            'avg_plays_per_day': round(total_plays / days, 1)
        }
    
    def clear_history(self, days_old: Optional[int] = None):
        """Limpa histórico (opcionalmente apenas antigo)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if days_old:
            cutoff = (datetime.now() - timedelta(days=days_old)).isoformat()
            cursor.execute("DELETE FROM history WHERE played_at < ?", (cutoff,))
        else:
            cursor.execute("DELETE FROM history")
        
        conn.commit()
        deleted = cursor.rowcount
        conn.close()
        
        return deleted