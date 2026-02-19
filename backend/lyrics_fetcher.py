import requests
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class LyricsFetcher:
    """
    Busca letras de músicas usando a API lyrics.ovh (gratuíta)
    """
    
    def __init__(self):
        self.base_url = "https://api.lyrics.ovh/v1"
    
    def get_lyrics(self, artist: str, title: str) -> Optional[str]:
        """
        Busca letra de uma música
        
        Args:
            artist: Nome do artista
            title: Título da música
        
        Returns:
            String com a letra ou None se não encontrado
        """
        try:
            # Limpar e formatar nomes
            artist_clean = self._clean_name(artist)
            title_clean = self._clean_name(title)
            
            url = f"{self.base_url}/{artist_clean}/{title_clean}"
            
            logger.info(f"Fetching lyrics for: {artist} - {title}")
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                lyrics = data.get('lyrics', '')
                
                if lyrics:
                    logger.info(f"Lyrics found ({len(lyrics)} chars)")
                    return lyrics
                else:
                    logger.warning("Empty lyrics returned")
                    return None
            
            elif response.status_code == 404:
                logger.warning(f"Lyrics not found for: {artist} - {title}")
                return None
            
            else:
                logger.error(f"API error: {response.status_code}")
                return None
        
        except requests.RequestException as e:
            logger.error(f"Request error: {e}")
            return None
        
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
    
    def _clean_name(self, name: str) -> str:
        """
        Limpa nome de artista/música para a URL
        Remove caracteres especiais e espaços extras
        """
        # Remove featuring, parentheses, etc
        name = name.split('(')[0]
        name = name.split('[')[0]
        name = name.split('feat')[0]
        name = name.split('ft.')[0]
        
        # Remove espaços extras
        name = ' '.join(name.split())
        
        return name.strip()
    
    def format_lyrics_for_display(self, lyrics: str) -> dict:
        """
        Formata letras para exibição
        Separa por linhas e adiciona timestamps simulados
        
        Args:
            lyrics: Letra em texto puro
        
        Returns:
            Dict com linhas formatadas
        """
        lines = lyrics.split('\n')
        
        # Filtrar linhas vazias
        lines = [line.strip() for line in lines if line.strip()]
        
        return {
            'lines': lines,
            'line_count': len(lines)
        }