import yt_dlp
import re
from typing import Optional, Dict, List

class MusicMatcher:
    """
    Classe responsável por fazer matching entre músicas do Spotify e vídeos do YouTube
    """
    
    def __init__(self):
        self.ydl_opts = {
            'format': 'bestaudio/best',
            'noplaylist': True,
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
    
    def spotify_to_youtube(self, track_name: str, artist_name: str, duration_ms: int) -> Optional[str]:
        """
        Encontra a melhor correspondência no YouTube para uma música do Spotify
        
        Args:
            track_name: Nome da música
            artist_name: Nome do artista
            duration_ms: Duração em milissegundos
        
        Returns:
            URL do YouTube ou None se não encontrar
        """
        # Limpa nome da música (remove features, remixes, etc)
        clean_track = self._clean_track_name(track_name)
        
        # Lista de queries para tentar
        queries = [
            f"{artist_name} {clean_track} official audio",
            f"{artist_name} {clean_track} audio",
            f"{artist_name} {track_name} official",
            f"{artist_name} {track_name}"
        ]
        
        best_match = None
        best_score = 0
        
        for query in queries:
            results = self._search_youtube(query, max_results=5)
            
            if not results:
                continue
            
            # Score cada resultado
            for result in results:
                score = self._score_result(result, track_name, artist_name, duration_ms)
                
                if score > best_score:
                    best_score = score
                    best_match = result
            
            # Se encontrou um match muito bom, para de buscar
            if best_score >= 80:
                break
        
        if best_match:
            return best_match['url']
        
        return None
    
    def _search_youtube(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Busca vídeos no YouTube
        """
        search_opts = self.ydl_opts.copy()
        search_opts['extract_flat'] = True
        
        try:
            with yt_dlp.YoutubeDL(search_opts) as ydl:
                search_results = ydl.extract_info(f"ytsearch{max_results}:{query}", download=False)
                
                if not search_results or 'entries' not in search_results:
                    return []
                
                results = []
                for entry in search_results['entries']:
                    if entry:
                        results.append({
                            'url': entry['url'],
                            'title': entry.get('title', ''),
                            'duration': entry.get('duration', 0),
                            'channel': entry.get('channel', ''),
                            'view_count': entry.get('view_count', 0)
                        })
                
                return results
        except Exception as e:
            print(f"Error searching YouTube: {e}")
            return []
    
    def _score_result(self, result: Dict, track_name: str, artist_name: str, duration_ms: int) -> float:
        """
        Calcula score de qualidade do match (0-100)
        """
        score = 0
        title = result['title'].lower()
        channel = result['channel'].lower()
        duration_seconds = duration_ms / 1000
        
        # +40 pontos: Duração similar (±15 segundos)
        duration_diff = abs(result['duration'] - duration_seconds)
        if duration_diff <= 5:
            score += 40
        elif duration_diff <= 15:
            score += 30
        elif duration_diff <= 30:
            score += 15
        
        # +25 pontos: Título contém nome da música
        if self._normalize_string(track_name) in self._normalize_string(title):
            score += 25
        
        # +20 pontos: Título ou canal contém nome do artista
        artist_normalized = self._normalize_string(artist_name)
        if artist_normalized in self._normalize_string(title) or artist_normalized in self._normalize_string(channel):
            score += 20
        
        # +10 pontos: Contém palavras-chave de qualidade
        quality_keywords = ['official', 'audio', 'lyric', 'hq', 'hd']
        for keyword in quality_keywords:
            if keyword in title:
                score += 2
        
        # -15 pontos: Contém palavras indesejáveis
        bad_keywords = ['cover', 'remix', 'live', 'acoustic', 'instrumental', 'karaoke', 'tutorial', 'reaction']
        for keyword in bad_keywords:
            if keyword in title:
                score -= 15
                break
        
        # +5 pontos: Canal verificado/oficial (baseado em VEVO, Topic, etc)
        if 'vevo' in channel or 'topic' in channel or 'official' in channel:
            score += 5
        
        return max(0, min(100, score))
    
    def _clean_track_name(self, track_name: str) -> str:
        """
        Remove informações extras do nome da música
        """
        # Remove conteúdo entre parênteses ou colchetes
        track_name = re.sub(r'\([^)]*\)', '', track_name)
        track_name = re.sub(r'\[[^]]*\]', '', track_name)
        
        # Remove "feat.", "ft.", etc
        track_name = re.sub(r'\s*[f|F](ea)?t\..*', '', track_name)
        
        return track_name.strip()
    
    def _normalize_string(self, s: str) -> str:
        """
        Normaliza string para comparação
        """
        # Remove acentos, converte para lowercase, remove pontuacao
        import unicodedata
        s = unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode('ASCII')
        s = s.lower()
        s = re.sub(r'[^a-z0-9\s]', '', s)
        return ' '.join(s.split())