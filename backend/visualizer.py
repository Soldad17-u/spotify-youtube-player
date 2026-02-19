import numpy as np
import threading
import time
from typing import List, Dict, Optional
import queue

class AudioVisualizer:
    """
    Analisador de espectro de áudio em tempo real
    
    Usa FFT (Fast Fourier Transform) para extrair frequências
    do áudio tocando e gerar dados para visualização
    """
    
    def __init__(self, num_bands: int = 64, sample_rate: int = 44100):
        """
        Args:
            num_bands: Número de bandas de frequência (default 64)
            sample_rate: Taxa de amostragem em Hz (default 44100)
        """
        self.num_bands = num_bands
        self.sample_rate = sample_rate
        
        # Estado
        self.enabled = False
        self.spectrum_data = [0.0] * num_bands
        self.peak_levels = [0.0] * num_bands
        
        # Smoothing para transições suaves
        self.smoothing_factor = 0.7  # 0-1 (maior = mais suave)
        self.previous_spectrum = [0.0] * num_bands
        
        # Thread de captura
        self.capture_thread: Optional[threading.Thread] = None
        self.running = False
        
        # Queue de samples de áudio
        self.audio_queue = queue.Queue(maxsize=100)
        
        print(f"AudioVisualizer initialized: {num_bands} bands @ {sample_rate}Hz")
    
    def start(self):
        """
        Inicia captura e análise de áudio
        """
        if self.running:
            return
        
        self.enabled = True
        self.running = True
        
        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()
        
        print("▶️ Visualizer started")
    
    def stop(self):
        """
        Para captura de áudio
        """
        self.enabled = False
        self.running = False
        
        if self.capture_thread:
            self.capture_thread.join(timeout=1)
        
        print("⏹️ Visualizer stopped")
    
    def _capture_loop(self):
        """
        Loop principal de captura (30 FPS)
        """
        fps = 30
        frame_time = 1.0 / fps
        
        while self.running:
            start_time = time.time()
            
            if self.enabled:
                # Processar audio da queue
                self._process_audio_frame()
            
            # Manter FPS constante
            elapsed = time.time() - start_time
            sleep_time = max(0, frame_time - elapsed)
            time.sleep(sleep_time)
    
    def _process_audio_frame(self):
        """
        Processa um frame de áudio e calcula espectro FFT
        """
        try:
            # Pegar samples da queue (timeout curto)
            samples = self.audio_queue.get(timeout=0.01)
            
            if len(samples) == 0:
                return
            
            # Aplicar FFT
            fft_data = np.fft.rfft(samples)
            fft_magnitude = np.abs(fft_data)
            
            # Dividir em bandas
            band_size = len(fft_magnitude) // self.num_bands
            
            for i in range(self.num_bands):
                start_idx = i * band_size
                end_idx = start_idx + band_size
                
                # Média da magnitude na banda
                band_value = np.mean(fft_magnitude[start_idx:end_idx])
                
                # Normalizar (0-1)
                normalized = min(1.0, band_value / 1000.0)
                
                # Aplicar smoothing
                smoothed = (
                    self.smoothing_factor * self.previous_spectrum[i] +
                    (1 - self.smoothing_factor) * normalized
                )
                
                self.spectrum_data[i] = smoothed
                self.previous_spectrum[i] = smoothed
                
                # Atualizar picos
                if smoothed > self.peak_levels[i]:
                    self.peak_levels[i] = smoothed
                else:
                    # Decaimento lento dos picos
                    self.peak_levels[i] *= 0.95
        
        except queue.Empty:
            # Sem áudio, decair gradualmente para zero
            for i in range(self.num_bands):
                self.spectrum_data[i] *= 0.9
                self.peak_levels[i] *= 0.95
        
        except Exception as e:
            print(f"Error processing audio: {e}")
    
    def add_audio_samples(self, samples: np.ndarray):
        """
        Adiciona samples de áudio para análise
        
        Args:
            samples: Array numpy de samples de áudio
        """
        if not self.enabled:
            return
        
        try:
            self.audio_queue.put_nowait(samples)
        except queue.Full:
            # Queue cheia, descartar frame (não é crítico)
            pass
    
    def get_spectrum_data(self) -> List[float]:
        """
        Retorna dados do espectro atual
        
        Returns:
            Lista de valores 0-1 para cada banda
        """
        return self.spectrum_data.copy()
    
    def get_peaks(self) -> List[float]:
        """
        Retorna níveis de pico de cada banda
        
        Returns:
            Lista de valores 0-1 para cada banda
        """
        return self.peak_levels.copy()
    
    def get_visualization_data(self) -> Dict:
        """
        Retorna dados completos para visualização
        
        Returns:
            Dict com spectrum, peaks, rms, enabled
        """
        spectrum = self.get_spectrum_data()
        peaks = self.get_peaks()
        
        # Calcular RMS (Root Mean Square) do espectro
        rms = np.sqrt(np.mean(np.array(spectrum) ** 2))
        
        # Detectar picos gerais
        overall_peak = max(spectrum) if spectrum else 0.0
        
        return {
            'enabled': self.enabled,
            'spectrum': spectrum,
            'peaks': peaks,
            'rms': float(rms),
            'overall_peak': float(overall_peak),
            'num_bands': self.num_bands,
            'sample_rate': self.sample_rate
        }
    
    def set_smoothing(self, factor: float):
        """
        Define fator de smoothing
        
        Args:
            factor: Valor 0-1 (maior = mais suave)
        """
        self.smoothing_factor = max(0.0, min(1.0, factor))
        print(f"Smoothing set to {self.smoothing_factor:.2f}")
    
    def reset_peaks(self):
        """
        Reseta níveis de pico
        """
        self.peak_levels = [0.0] * self.num_bands
    
    def toggle_enabled(self) -> bool:
        """
        Liga/desliga visualizador
        
        Returns:
            Estado após toggle
        """
        self.enabled = not self.enabled
        
        if self.enabled and not self.running:
            self.start()
        
        print(f"Visualizer {'enabled' if self.enabled else 'disabled'}")
        return self.enabled
    
    def get_frequency_range(self, band_index: int) -> tuple:
        """
        Retorna range de frequência de uma banda específica
        
        Args:
            band_index: Índice da banda (0 a num_bands-1)
        
        Returns:
            Tupla (freq_min, freq_max) em Hz
        """
        if band_index < 0 or band_index >= self.num_bands:
            return (0, 0)
        
        # Frequência máxima é metade do sample rate (Nyquist)
        max_freq = self.sample_rate / 2
        
        band_width = max_freq / self.num_bands
        
        freq_min = band_index * band_width
        freq_max = (band_index + 1) * band_width
        
        return (int(freq_min), int(freq_max))
    
    def __del__(self):
        """
        Cleanup ao destruir
        """
        self.stop()

# Funções utilitárias para geração de dados de teste

def generate_test_spectrum(num_bands: int = 64) -> List[float]:
    """
    Gera espectro de teste para debugging
    
    Returns:
        Lista de valores aleatórios 0-1
    """
    return [np.random.random() * 0.8 for _ in range(num_bands)]

def generate_bass_heavy_spectrum(num_bands: int = 64) -> List[float]:
    """
    Gera espectro com mais graves (para testes)
    
    Returns:
        Lista com valores maiores nas primeiras bandas
    """
    spectrum = []
    for i in range(num_bands):
        # Decai exponencialmente
        value = np.exp(-i / (num_bands * 0.2)) * np.random.uniform(0.5, 1.0)
        spectrum.append(min(1.0, value))
    return spectrum

def spectrum_to_bars(spectrum: List[float], height: int = 100) -> List[int]:
    """
    Converte espectro para alturas de barras (para visualização)
    
    Args:
        spectrum: Lista de valores 0-1
        height: Altura máxima em pixels
    
    Returns:
        Lista de alturas em pixels
    """
    return [int(value * height) for value in spectrum]