import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class UserData:
    """
    Gerencia histórico de reprodução e favoritos do usuário
    """
    
    def __init__(self, db_file: str = 'user_data.db'):
        self.db_file = db_file
        self.conn = sqlite3.connect(db_file, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        
        self._create_tables()
        logger.info(f"UserData initialized with database: {db_file}")
    
    def _create_tables(self):
        """
        Cria tabelas do banco de dados
        """
        cursor = self.conn.cursor()
        
        # History table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                track_id TEXT NOT NULL,
                track_name TEXT,
                artist TEXT,
                album TEXT,
                duration INTEGER,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed BOOLEAN DEFAULT 1
            )
        ''')
        
        # Favorites table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS favorites (
                track_id TEXT PRIMARY KEY,
                track_name TEXT,
                artist TEXT,
                album TEXT,
                album_art TEXT,
                duration INTEGER,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Play count table (aggregated)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS play_stats (
                track_id TEXT PRIMARY KEY,
                play_count INTEGER DEFAULT 0,
                last_played TIMESTAMP,
                total_time_played INTEGER DEFAULT 0
            )
        ''')
        
        self.conn.commit()
        logger.debug("Database tables created/verified")
    
    # ========== HISTORY ==========
    
    def add_to_history(self, track_info: Dict, completed: bool = True):
        """
        Adiciona música ao histórico
        
        Args:
            track_info: Dict com info da música (id, name, artist, album, duration)
            completed: Se a música foi ouvida até o fim
        """
        try:
            cursor = self.conn.cursor()
            
            # Add to history
            cursor.execute('''
                INSERT INTO history (track_id, track_name, artist, album, duration, completed)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                track_info.get('id'),
                track_info.get('name'),
                track_info.get('artist'),
                track_info.get('album'),
                track_info.get('duration', 0),
                completed
            ))
            
            # Update play stats
            cursor.execute('''
                INSERT INTO play_stats (track_id, play_count, last_played, total_time_played)
                VALUES (?, 1, CURRENT_TIMESTAMP, ?)
                ON CONFLICT(track_id) DO UPDATE SET
                    play_count = play_count + 1,
                    last_played = CURRENT_TIMESTAMP,
                    total_time_played = total_time_played + ?
            ''', (
                track_info.get('id'),
                track_info.get('duration', 0),
                track_info.get('duration', 0)
            ))
            
            self.conn.commit()
            logger.debug(f"Added to history: {track_info.get('name')}")
        
        except Exception as e:
            logger.error(f"Error adding to history: {e}")
    
    def get_history(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """
        Retorna histórico de reprodução
        
        Args:
            limit: Número máximo de resultados
            offset: Offset para paginação
        
        Returns:
            Lista de músicas do histórico
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                SELECT * FROM history
                ORDER BY played_at DESC
                LIMIT ? OFFSET ?
            ''', (limit, offset))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            logger.error(f"Error getting history: {e}")
            return []
    
    def get_recent_tracks(self, limit: int = 20) -> List[Dict]:
        """
        Retorna músicas tocadas recentemente (sem duplicatas)
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                SELECT DISTINCT track_id, track_name, artist, album, 
                       MAX(played_at) as last_played
                FROM history
                GROUP BY track_id
                ORDER BY last_played DESC
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            logger.error(f"Error getting recent tracks: {e}")
            return []
    
    def get_most_played(self, limit: int = 20) -> List[Dict]:
        """
        Retorna músicas mais tocadas
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                SELECT ps.*, h.track_name, h.artist, h.album
                FROM play_stats ps
                JOIN history h ON ps.track_id = h.track_id
                GROUP BY ps.track_id
                ORDER BY ps.play_count DESC
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            logger.error(f"Error getting most played: {e}")
            return []
    
    def clear_history(self, older_than_days: Optional[int] = None):
        """
        Limpa histórico
        
        Args:
            older_than_days: Se especificado, remove apenas itens mais antigos que X dias
        """
        try:
            cursor = self.conn.cursor()
            
            if older_than_days:
                cutoff_date = datetime.now() - timedelta(days=older_than_days)
                cursor.execute('''
                    DELETE FROM history
                    WHERE played_at < ?
                ''', (cutoff_date,))
                logger.info(f"Cleared history older than {older_than_days} days")
            else:
                cursor.execute('DELETE FROM history')
                cursor.execute('DELETE FROM play_stats')
                logger.info("Cleared all history")
            
            self.conn.commit()
        
        except Exception as e:
            logger.error(f"Error clearing history: {e}")
    
    # ========== FAVORITES ==========
    
    def add_favorite(self, track_info: Dict) -> bool:
        """
        Adiciona música aos favoritos
        
        Args:
            track_info: Dict com info da música
        
        Returns:
            True se adicionado com sucesso
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO favorites (track_id, track_name, artist, album, album_art, duration)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                track_info.get('id'),
                track_info.get('name'),
                track_info.get('artist'),
                track_info.get('album'),
                track_info.get('album_art'),
                track_info.get('duration', 0)
            ))
            
            self.conn.commit()
            logger.info(f"Added to favorites: {track_info.get('name')}")
            return True
        
        except sqlite3.IntegrityError:
            logger.warning(f"Track already in favorites: {track_info.get('id')}")
            return False
        except Exception as e:
            logger.error(f"Error adding favorite: {e}")
            return False
    
    def remove_favorite(self, track_id: str) -> bool:
        """
        Remove música dos favoritos
        
        Returns:
            True se removido com sucesso
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('DELETE FROM favorites WHERE track_id = ?', (track_id,))
            self.conn.commit()
            
            if cursor.rowcount > 0:
                logger.info(f"Removed from favorites: {track_id}")
                return True
            else:
                logger.warning(f"Track not in favorites: {track_id}")
                return False
        
        except Exception as e:
            logger.error(f"Error removing favorite: {e}")
            return False
    
    def is_favorite(self, track_id: str) -> bool:
        """
        Verifica se música está nos favoritos
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('SELECT 1 FROM favorites WHERE track_id = ?', (track_id,))
            return cursor.fetchone() is not None
        except Exception as e:
            logger.error(f"Error checking favorite: {e}")
            return False
    
    def get_favorites(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """
        Retorna lista de favoritos
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                SELECT * FROM favorites
                ORDER BY added_at DESC
                LIMIT ? OFFSET ?
            ''', (limit, offset))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        
        except Exception as e:
            logger.error(f"Error getting favorites: {e}")
            return []
    
    def get_favorites_count(self) -> int:
        """
        Retorna número de favoritos
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM favorites')
            return cursor.fetchone()[0]
        except Exception as e:
            logger.error(f"Error counting favorites: {e}")
            return 0
    
    # ========== STATISTICS ==========
    
    def get_statistics(self) -> Dict:
        """
        Retorna estatísticas gerais
        """
        try:
            cursor = self.conn.cursor()
            
            # Total plays
            cursor.execute('SELECT COUNT(*) FROM history')
            total_plays = cursor.fetchone()[0]
            
            # Unique tracks
            cursor.execute('SELECT COUNT(DISTINCT track_id) FROM history')
            unique_tracks = cursor.fetchone()[0]
            
            # Total listening time (seconds)
            cursor.execute('SELECT SUM(duration) FROM history WHERE completed = 1')
            total_time = cursor.fetchone()[0] or 0
            
            # Favorites count
            favorites_count = self.get_favorites_count()
            
            return {
                'total_plays': total_plays,
                'unique_tracks': unique_tracks,
                'total_listening_time': total_time,
                'total_listening_hours': round(total_time / 3600, 1),
                'favorites_count': favorites_count
            }
        
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return {}
    
    def __del__(self):
        """
        Fecha conexão ao destruir objeto
        """
        if hasattr(self, 'conn'):
            self.conn.close()
            logger.debug("Database connection closed")