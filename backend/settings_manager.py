import json
import os
from typing import Dict, Any

class SettingsManager:
    """
    Gerencia preferências e configurações do usuário
    """
    
    DEFAULT_SETTINGS = {
        'audio': {
            'volume': 70,
            'equalizer_preset': 'flat',
            'normalize_volume': False,
            'crossfade_duration': 0
        },
        'playback': {
            'shuffle': False,
            'repeat': 'off',
            'auto_play': True,
            'gapless': False
        },
        'quality': {
            'audio_quality': 'high',  # low, medium, high
            'youtube_format': 'bestaudio'
        },
        'ui': {
            'theme': 'dark',  # dark, light, auto
            'show_lyrics': True,
            'show_visualizer': False,
            'mini_mode_on_minimize': False,
            'start_minimized_to_tray': False
        },
        'notifications': {
            'enabled': True,
            'show_on_track_change': True,
            'show_album_art': True
        },
        'cache': {
            'enabled': True,
            'max_size_gb': 10,
            'auto_cleanup': True,
            'cleanup_after_days': 30
        },
        'scrobbling': {
            'lastfm_enabled': False,
            'lastfm_username': '',
            'lastfm_api_key': ''
        },
        'advanced': {
            'preload_next_track': True,
            'hardware_acceleration': True,
            'log_level': 'info'
        }
    }
    
    def __init__(self, config_file: str = "config/settings.json"):
        self.config_file = config_file
        self.settings = self._load_settings()
    
    def _load_settings(self) -> Dict:
        """Carrega configurações do arquivo"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    loaded = json.load(f)
                    # Merge with defaults (para novas configurações)
                    return self._merge_dicts(self.DEFAULT_SETTINGS, loaded)
            except Exception as e:
                print(f"Error loading settings: {e}")
                return self.DEFAULT_SETTINGS.copy()
        else:
            return self.DEFAULT_SETTINGS.copy()
    
    def _merge_dicts(self, default: Dict, custom: Dict) -> Dict:
        """Merge recursivo de dicionários"""
        result = default.copy()
        
        for key, value in custom.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_dicts(result[key], value)
            else:
                result[key] = value
        
        return result
    
    def save_settings(self) -> bool:
        """Salva configurações no arquivo"""
        try:
            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
            
            with open(self.config_file, 'w') as f:
                json.dump(self.settings, f, indent=2)
            
            print("Settings saved")
            return True
        
        except Exception as e:
            print(f"Error saving settings: {e}")
            return False
    
    def get(self, category: str, key: str = None) -> Any:
        """Obtém uma configuração"""
        if key:
            return self.settings.get(category, {}).get(key)
        else:
            return self.settings.get(category, {})
    
    def set(self, category: str, key: str, value: Any) -> bool:
        """Define uma configuração"""
        if category not in self.settings:
            self.settings[category] = {}
        
        self.settings[category][key] = value
        return self.save_settings()
    
    def get_all(self) -> Dict:
        """Retorna todas as configurações"""
        return self.settings.copy()
    
    def reset_to_defaults(self) -> bool:
        """Reseta todas as configurações para padrão"""
        self.settings = self.DEFAULT_SETTINGS.copy()
        return self.save_settings()
    
    def export_settings(self, file_path: str) -> bool:
        """Exporta configurações para arquivo"""
        try:
            with open(file_path, 'w') as f:
                json.dump(self.settings, f, indent=2)
            return True
        except Exception as e:
            print(f"Error exporting settings: {e}")
            return False
    
    def import_settings(self, file_path: str) -> bool:
        """Importa configurações de arquivo"""
        try:
            with open(file_path, 'r') as f:
                imported = json.load(f)
            
            self.settings = self._merge_dicts(self.DEFAULT_SETTINGS, imported)
            return self.save_settings()
        
        except Exception as e:
            print(f"Error importing settings: {e}")
            return False