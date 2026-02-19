import json
import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class Equalizer:
    """
    3-band equalizer with bass, mid, treble controls
    Valores em dB (-12 a +12)
    """
    
    PRESETS = {
        'flat': {'bass': 0, 'mid': 0, 'treble': 0},
        'bass_boost': {'bass': 8, 'mid': 0, 'treble': -2},
        'treble_boost': {'bass': -2, 'mid': 0, 'treble': 8},
        'vocal': {'bass': -3, 'mid': 6, 'treble': 2},
        'rock': {'bass': 6, 'mid': -2, 'treble': 5},
        'pop': {'bass': 4, 'mid': 2, 'treble': 3},
        'classical': {'bass': -2, 'mid': 4, 'treble': 4},
        'jazz': {'bass': 4, 'mid': 3, 'treble': 2},
        'electronic': {'bass': 10, 'mid': 0, 'treble': 6}
    }
    
    def __init__(self, settings_file: str = 'equalizer_settings.json'):
        self.settings_file = settings_file
        self.bass = 0
        self.mid = 0
        self.treble = 0
        self.enabled = False
        
        # Load saved settings
        self.load_settings()
        
        logger.info(f"Equalizer initialized: bass={self.bass}, mid={self.mid}, treble={self.treble}")
    
    def set_band(self, band: str, value: float) -> bool:
        """
        Define valor de uma banda (-12 a +12 dB)
        
        Args:
            band: 'bass', 'mid', ou 'treble'
            value: Valor em dB (-12 a +12)
        
        Returns:
            True se sucesso
        """
        # Clamp value
        value = max(-12, min(12, value))
        
        if band == 'bass':
            self.bass = value
        elif band == 'mid':
            self.mid = value
        elif band == 'treble':
            self.treble = value
        else:
            logger.error(f"Invalid band: {band}")
            return False
        
        logger.info(f"EQ {band} set to {value}dB")
        self.save_settings()
        return True
    
    def set_all_bands(self, bass: float, mid: float, treble: float):
        """
        Define todas as bandas de uma vez
        """
        self.bass = max(-12, min(12, bass))
        self.mid = max(-12, min(12, mid))
        self.treble = max(-12, min(12, treble))
        
        logger.info(f"EQ set to bass={self.bass}, mid={self.mid}, treble={self.treble}")
        self.save_settings()
    
    def load_preset(self, preset_name: str) -> bool:
        """
        Carrega um preset pré-definido
        
        Args:
            preset_name: Nome do preset
        
        Returns:
            True se preset existe
        """
        if preset_name not in self.PRESETS:
            logger.error(f"Preset not found: {preset_name}")
            return False
        
        preset = self.PRESETS[preset_name]
        self.set_all_bands(preset['bass'], preset['mid'], preset['treble'])
        
        logger.info(f"Loaded preset: {preset_name}")
        return True
    
    def get_settings(self) -> Dict:
        """
        Retorna configurações atuais
        """
        return {
            'bass': self.bass,
            'mid': self.mid,
            'treble': self.treble,
            'enabled': self.enabled
        }
    
    def toggle_enabled(self) -> bool:
        """
        Liga/desliga equalizer
        
        Returns:
            Novo estado (True = ligado)
        """
        self.enabled = not self.enabled
        logger.info(f"Equalizer {'enabled' if self.enabled else 'disabled'}")
        self.save_settings()
        return self.enabled
    
    def set_enabled(self, enabled: bool):
        """
        Define estado do equalizer
        """
        self.enabled = enabled
        logger.info(f"Equalizer {'enabled' if enabled else 'disabled'}")
        self.save_settings()
    
    def get_vlc_equalizer_string(self) -> str:
        """
        Gera string de configuração para VLC
        
        VLC usa formato: "preamp=XX:bands=XX XX XX XX XX XX XX XX XX XX"
        Vamos simplificar para 3 bandas principais
        
        Returns:
            String de configuração VLC
        """
        if not self.enabled:
            return "preamp=0:bands=0 0 0 0 0 0 0 0 0 0"
        
        # Map our 3 bands to VLC's 10 bands
        # Bass: bands 0-2 (60Hz, 170Hz, 310Hz)
        # Mid: bands 3-6 (600Hz, 1kHz, 3kHz, 6kHz)
        # Treble: bands 7-9 (12kHz, 14kHz, 16kHz)
        
        bands = [
            self.bass, self.bass, self.bass,  # Low
            self.mid, self.mid, self.mid, self.mid,  # Mid
            self.treble, self.treble, self.treble  # High
        ]
        
        bands_str = ' '.join([str(int(b)) for b in bands])
        return f"preamp=0:bands={bands_str}"
    
    def save_settings(self):
        """
        Salva configurações em arquivo JSON
        """
        try:
            settings = {
                'bass': self.bass,
                'mid': self.mid,
                'treble': self.treble,
                'enabled': self.enabled
            }
            
            with open(self.settings_file, 'w') as f:
                json.dump(settings, f, indent=2)
            
            logger.debug(f"EQ settings saved to {self.settings_file}")
        except Exception as e:
            logger.error(f"Error saving EQ settings: {e}")
    
    def load_settings(self):
        """
        Carrega configurações do arquivo JSON
        """
        if not os.path.exists(self.settings_file):
            logger.info("No saved EQ settings found, using defaults")
            return
        
        try:
            with open(self.settings_file, 'r') as f:
                settings = json.load(f)
            
            self.bass = settings.get('bass', 0)
            self.mid = settings.get('mid', 0)
            self.treble = settings.get('treble', 0)
            self.enabled = settings.get('enabled', False)
            
            logger.info(f"EQ settings loaded from {self.settings_file}")
        except Exception as e:
            logger.error(f"Error loading EQ settings: {e}")
    
    def get_presets(self) -> Dict:
        """
        Retorna todos os presets disponíveis
        """
        return self.PRESETS.copy()
    
    def reset(self):
        """
        Reseta equalizer para flat (0,0,0)
        """
        self.load_preset('flat')
        logger.info("Equalizer reset to flat")