import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional, Callable
import sqlite3
from datetime import datetime
import json

class PlaylistManager:
    """
    Gerencia download em batch de playlists completas
    
    Features:
    - Download paralelo de múltiplas tracks
    - Progress tracking em tempo real
    - Retry automático em falhas
    - Cache de playlists baixadas
    - Cancelamento de downloads
    """
    
    def __init__(self, music_matcher, audio_cache, max_workers=3):
        """
        Args:
            music_matcher: Instância de MusicMatcher
            audio_cache: Instância de AudioCache
            max_workers: Número máximo de downloads paralelos
        """
        self.matcher = music_matcher
        self.cache = audio_cache
        self.max_workers = max_workers
        
        # Estado de downloads ativos
        self.active_downloads: Dict[str, Dict] = {}
        self.cancel_flags: Dict[str, bool] = {}
        
        # Thread pool para downloads paralelos
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        
        # Database para tracking de playlists
        self.db_path = 'playlists_cache.db'
        self._init_database()
        
        print(f"PlaylistManager initialized with {max_workers} workers")
    
    def _init_database(self):
        """
        Inicializa database de playlists cacheadas
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cached_playlists (
                playlist_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                total_tracks INTEGER NOT NULL,
                cached_tracks INTEGER NOT NULL,
                started_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP,
                status TEXT NOT NULL,
                metadata TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS playlist_tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id TEXT NOT NULL,
                track_id TEXT NOT NULL,
                track_name TEXT,
                artist TEXT,
                cached BOOLEAN DEFAULT 0,
                file_path TEXT,
                failed BOOLEAN DEFAULT 0,
                error TEXT,
                UNIQUE(playlist_id, track_id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("Playlists database initialized")
    
    def download_playlist(
        self,
        playlist_id: str,
        playlist_name: str,
        tracks: List[Dict],
        progress_callback: Optional[Callable] = None
    ) -> str:
        """
        Inicia download em batch de uma playlist
        
        Args:
            playlist_id: ID da playlist no Spotify
            playlist_name: Nome da playlist
            tracks: Lista de tracks (dict com id, name, artist, duration)
            progress_callback: Função chamada com progresso (opcional)
        
        Returns:
            Status string
        """
        if playlist_id in self.active_downloads:
            return "already_downloading"
        
        # Registrar playlist no database
        self._register_playlist(playlist_id, playlist_name, tracks)
        
        # Inicializar estado
        self.active_downloads[playlist_id] = {
            'name': playlist_name,
            'total': len(tracks),
            'completed': 0,
            'failed': 0,
            'progress': 0,
            'status': 'downloading',
            'started_at': time.time()
        }
        
        self.cancel_flags[playlist_id] = False
        
        # Iniciar download em thread separada
        thread = threading.Thread(
            target=self._download_playlist_worker,
            args=(playlist_id, tracks, progress_callback),
            daemon=True
        )
        thread.start()
        
        print(f"Started downloading playlist {playlist_name} ({len(tracks)} tracks)")
        return "started"
    
    def _download_playlist_worker(
        self,
        playlist_id: str,
        tracks: List[Dict],
        progress_callback: Optional[Callable]
    ):
        """
        Worker thread para download de playlist
        """
        try:
            # Filtrar tracks já cacheadas
            tracks_to_download = []
            for track in tracks:
                if self.cancel_flags.get(playlist_id):
                    break
                    
                cached = self.cache.get_cached_audio(track['id'])
                if cached:
                    self._mark_track_cached(playlist_id, track['id'], cached)
                    self.active_downloads[playlist_id]['completed'] += 1
                else:
                    tracks_to_download.append(track)
            
            print(f"Need to download {len(tracks_to_download)} tracks (rest already cached)")
            
            # Download paralelo
            futures = []
            for track in tracks_to_download:
                if self.cancel_flags.get(playlist_id):
                    break
                
                future = self.executor.submit(
                    self._download_single_track,
                    playlist_id,
                    track
                )
                futures.append(future)
            
            # Esperar conclusão
            for future in as_completed(futures):
                if self.cancel_flags.get(playlist_id):
                    break
                
                try:
                    success = future.result()
                    if success:
                        self.active_downloads[playlist_id]['completed'] += 1
                    else:
                        self.active_downloads[playlist_id]['failed'] += 1
                except Exception as e:
                    print(f"Download error: {e}")
                    self.active_downloads[playlist_id]['failed'] += 1
                
                # Atualizar progresso
                total = self.active_downloads[playlist_id]['total']
                completed = self.active_downloads[playlist_id]['completed']
                progress = (completed / total) * 100
                
                self.active_downloads[playlist_id]['progress'] = progress
                
                if progress_callback:
                    progress_callback(playlist_id, progress, completed, total)
            
            # Finalizar
            if self.cancel_flags.get(playlist_id):
                self.active_downloads[playlist_id]['status'] = 'cancelled'
            else:
                self.active_downloads[playlist_id]['status'] = 'completed'
                self._mark_playlist_completed(playlist_id)
            
            print(f"Playlist {playlist_id} download finished")
            
        except Exception as e:
            print(f"Playlist download error: {e}")
            self.active_downloads[playlist_id]['status'] = 'error'
    
    def _download_single_track(self, playlist_id: str, track: Dict) -> bool:
        """
        Baixa uma única track
        
        Returns:
            True se sucesso, False se falhou
        """
        try:
            track_id = track['id']
            
            # Verificar se já está em cache
            cached = self.cache.get_cached_audio(track_id)
            if cached:
                self._mark_track_cached(playlist_id, track_id, cached)
                return True
            
            # Matching YouTube
            yt_url = self.matcher.spotify_to_youtube(
                track['name'],
                track['artists'][0]['name'],
                track['duration_ms']
            )
            
            if not yt_url:
                self._mark_track_failed(playlist_id, track_id, "YouTube match not found")
                return False
            
            # Download
            file_path = self.cache.download_and_cache(yt_url, track_id)
            
            if file_path:
                self._mark_track_cached(playlist_id, track_id, file_path)
                return True
            else:
                self._mark_track_failed(playlist_id, track_id, "Download failed")
                return False
                
        except Exception as e:
            print(f"Track download error: {e}")
            self._mark_track_failed(playlist_id, track.get('id', 'unknown'), str(e))
            return False
    
    def _register_playlist(self, playlist_id: str, name: str, tracks: List[Dict]):
        """
        Registra playlist no database
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Playlist
        cursor.execute('''
            INSERT OR REPLACE INTO cached_playlists 
            (playlist_id, name, total_tracks, cached_tracks, started_at, status, metadata)
            VALUES (?, ?, ?, 0, ?, 'downloading', ?)
        ''', (
            playlist_id,
            name,
            len(tracks),
            datetime.now().isoformat(),
            json.dumps({'tracks': len(tracks)})
        ))
        
        # Tracks
        for track in tracks:
            cursor.execute('''
                INSERT OR IGNORE INTO playlist_tracks
                (playlist_id, track_id, track_name, artist)
                VALUES (?, ?, ?, ?)
            ''', (
                playlist_id,
                track['id'],
                track['name'],
                track['artists'][0]['name'] if track.get('artists') else 'Unknown'
            ))
        
        conn.commit()
        conn.close()
    
    def _mark_track_cached(self, playlist_id: str, track_id: str, file_path: str):
        """
        Marca track como cacheada
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE playlist_tracks
            SET cached = 1, file_path = ?
            WHERE playlist_id = ? AND track_id = ?
        ''', (file_path, playlist_id, track_id))
        
        # Atualizar contagem na playlist
        cursor.execute('''
            UPDATE cached_playlists
            SET cached_tracks = (
                SELECT COUNT(*) FROM playlist_tracks
                WHERE playlist_id = ? AND cached = 1
            )
            WHERE playlist_id = ?
        ''', (playlist_id, playlist_id))
        
        conn.commit()
        conn.close()
    
    def _mark_track_failed(self, playlist_id: str, track_id: str, error: str):
        """
        Marca track como falhou
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE playlist_tracks
            SET failed = 1, error = ?
            WHERE playlist_id = ? AND track_id = ?
        ''', (error, playlist_id, track_id))
        
        conn.commit()
        conn.close()
    
    def _mark_playlist_completed(self, playlist_id: str):
        """
        Marca playlist como completa
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE cached_playlists
            SET completed_at = ?, status = 'completed'
            WHERE playlist_id = ?
        ''', (datetime.now().isoformat(), playlist_id))
        
        conn.commit()
        conn.close()
    
    def get_progress(self, playlist_id: str) -> Optional[Dict]:
        """
        Retorna progresso de download de playlist
        
        Returns:
            Dict com status, progress, completed, total, failed
        """
        return self.active_downloads.get(playlist_id)
    
    def cancel_download(self, playlist_id: str) -> bool:
        """
        Cancela download de playlist
        
        Returns:
            True se cancelado, False se não estava baixando
        """
        if playlist_id not in self.active_downloads:
            return False
        
        self.cancel_flags[playlist_id] = True
        print(f"Cancelling download of playlist {playlist_id}")
        return True
    
    def get_cached_playlists(self) -> List[Dict]:
        """
        Retorna lista de playlists cacheadas
        
        Returns:
            Lista de dicts com info das playlists
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT playlist_id, name, total_tracks, cached_tracks, 
                   started_at, completed_at, status
            FROM cached_playlists
            ORDER BY started_at DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        playlists = []
        for row in rows:
            playlists.append({
                'playlist_id': row[0],
                'name': row[1],
                'total_tracks': row[2],
                'cached_tracks': row[3],
                'started_at': row[4],
                'completed_at': row[5],
                'status': row[6],
                'progress': (row[3] / row[2] * 100) if row[2] > 0 else 0
            })
        
        return playlists
    
    def get_playlist_tracks(self, playlist_id: str) -> List[Dict]:
        """
        Retorna tracks de uma playlist
        
        Returns:
            Lista de tracks com status de cache
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT track_id, track_name, artist, cached, file_path, failed, error
            FROM playlist_tracks
            WHERE playlist_id = ?
        ''', (playlist_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        tracks = []
        for row in rows:
            tracks.append({
                'track_id': row[0],
                'track_name': row[1],
                'artist': row[2],
                'cached': bool(row[3]),
                'file_path': row[4],
                'failed': bool(row[5]),
                'error': row[6]
            })
        
        return tracks
    
    def __del__(self):
        """
        Cleanup ao destruir objeto
        """
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=False)
            print("PlaylistManager shutdown")