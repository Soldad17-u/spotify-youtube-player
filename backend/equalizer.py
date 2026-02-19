import vlc
from typing import Dict, List

class Equalizer:
    """
    Equalizador de 10 bandas para controle de áudio
    """
    
    # Presets comuns (valores em dB para cada banda)
    PRESETS = {
        'flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        'pop': [-1, -1, 0, 2, 4, 4, 2, 0, -1, -1],
        'rock': [3, 2, 1, 0, -1, -1, 0, 1, 2, 3],
        'jazz': [3, 2, 1, 1, 0, 0, 1, 2, 2, 3],
        'classical': [3, 2, 1, 0, 0, 0, 0, 1, 2, 3],
        'bass_boost': [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
        'treble_boost': [0, 0, 0, 0, 0, 0, 2, 4, 5, 6],
        'vocal': [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
        'electronic': [4, 3, 1, 0, -2, 2, 0, 1, 3, 4],
        'loudness': [5, 3, 0, 0, 0, 0, 0, 0, 3, 5]
    }
    
    # Frequências das 10 bandas (Hz)
    BANDS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
    
    def __init__(self, player: vlc.MediaPlayer):
        self.player = player
        self.equalizer = vlc.AudioEqualizer()
        self.current_preset = 'flat'
        self.current_values = [0] * 10
        self._apply_preset('flat')
    
    def set_preset(self, preset_name: str) -> bool:
        """
        Aplica um preset de equalização
        
        Args:
            preset_name: Nome do preset
        
        Returns:
            True se aplicado com sucesso
        """
        if preset_name not in self.PRESETS:
            return False
        
        self._apply_preset(preset_name)
        return True
    
    def _apply_preset(self, preset_name: str):
        """Aplica valores de um preset"""
        values = self.PRESETS[preset_name]
        
        for i, value in enumerate(values):
            self.equalizer.set_amp_at_index(value, i)
        
        self.player.set_equalizer(self.equalizer)
        self.current_preset = preset_name
        self.current_values = values.copy()
        
        print(f"EQ preset applied: {preset_name}")
    
    def set_band(self, band_index: int, value: float) -> bool:
        """
        Define valor de uma banda específica
        
        Args:
            band_index: Índice da banda (0-9)
            value: Valor em dB (-20 a +20)
        
        Returns:
            True se aplicado com sucesso
        """
        if band_index < 0 or band_index > 9:
            return False
        
        if value < -20 or value > 20:
            return False
        
        self.equalizer.set_amp_at_index(value, band_index)
        self.player.set_equalizer(self.equalizer)
        self.current_values[band_index] = value
        self.current_preset = 'custom'
        
        print(f"EQ band {band_index} ({self.BANDS[band_index]}Hz) set to {value}dB")
        return True
    
    def set_all_bands(self, values: List[float]) -> bool:
        """
        Define valores de todas as bandas
        
        Args:
            values: Lista com 10 valores em dB
        
        Returns:
            True se aplicado com sucesso
        """
        if len(values) != 10:
            return False
        
        for i, value in enumerate(values):
            if value < -20 or value > 20:
                return False
            self.equalizer.set_amp_at_index(value, i)
        
        self.player.set_equalizer(self.equalizer)
        self.current_values = values.copy()
        self.current_preset = 'custom'
        
        print("EQ custom values applied")
        return True
    
    def reset(self):
        """Reseta equalização para flat"""
        self._apply_preset('flat')
    
    def get_status(self) -> Dict:
        """Retorna status atual do equaliza dor"""
        return {
            'preset': self.current_preset,
            'bands': [
                {
                    'frequency': freq,
                    'value': val
                }
                for freq, val in zip(self.BANDS, self.current_values)
            ],
            'available_presets': list(self.PRESETS.keys())
        }