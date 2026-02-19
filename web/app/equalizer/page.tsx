'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
  preset: string;
}

const PRESETS = [
  { name: 'Flat', bass: 0, mid: 0, treble: 0 },
  { name: 'Rock', bass: 5, mid: 3, treble: 4 },
  { name: 'Pop', bass: 4, mid: 2, treble: 3 },
  { name: 'Jazz', bass: 3, mid: 4, treble: 3 },
  { name: 'Classical', bass: 2, mid: 3, treble: 5 },
  { name: 'Bass Boost', bass: 8, mid: 0, treble: 2 },
  { name: 'Vocal', bass: -2, mid: 5, treble: 3 },
];

export default function EqualizerPage() {
  const [eq, setEq] = useState<EQSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
    preset: 'Flat',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadEQ();
  }, []);

  const loadEQ = async () => {
    try {
      const data = await api.getEqualizer();
      setEq(data);
    } catch (err) {
      console.error('Failed to load EQ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBandChange = async (band: 'bass' | 'mid' | 'treble', value: number) => {
    setEq({ ...eq, [band]: value, preset: 'Custom' });
    
    try {
      await api.setEQBand(band, value);
    } catch (err) {
      console.error(`Failed to set ${band}:`, err);
    }
  };

  const handlePreset = async (preset: typeof PRESETS[0]) => {
    setUpdating(true);
    setEq({
      bass: preset.bass,
      mid: preset.mid,
      treble: preset.treble,
      preset: preset.name,
    });

    try {
      await api.applyEQPreset(preset.name.toLowerCase().replace(' ', '_'));
    } catch (err) {
      console.error('Failed to apply preset:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getBandColor = (band: string) => {
    switch (band) {
      case 'bass': return '#EF4444'; // Red
      case 'mid': return '#10B981';  // Green
      case 'treble': return '#3B82F6'; // Blue
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading equalizer...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">🎚️ Equalizer</h1>
        <p className="text-gray-400 mb-8">Adjust audio frequencies to your preference</p>

        {/* Presets */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Presets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                disabled={updating}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  eq.preset === preset.name
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Band EQ Sliders */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Manual Adjustment</h2>
          
          <div className="space-y-12">
            {/* Bass */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-lg font-medium" style={{ color: getBandColor('bass') }}>
                  🔊 Bass
                </label>
                <span className="text-2xl font-bold text-white">
                  {eq.bass > 0 ? '+' : ''}{eq.bass} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.bass}
                onChange={(e) => handleBandChange('bass', parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${((eq.bass + 12) / 24) * 100}%, #374151 ${((eq.bass + 12) / 24) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-12 dB</span>
                <span>0 dB</span>
                <span>+12 dB</span>
              </div>
            </div>

            {/* Mid */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-lg font-medium" style={{ color: getBandColor('mid') }}>
                  🎵 Mid
                </label>
                <span className="text-2xl font-bold text-white">
                  {eq.mid > 0 ? '+' : ''}{eq.mid} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.mid}
                onChange={(e) => handleBandChange('mid', parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${((eq.mid + 12) / 24) * 100}%, #374151 ${((eq.mid + 12) / 24) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-12 dB</span>
                <span>0 dB</span>
                <span>+12 dB</span>
              </div>
            </div>

            {/* Treble */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-lg font-medium" style={{ color: getBandColor('treble') }}>
                  ✨ Treble
                </label>
                <span className="text-2xl font-bold text-white">
                  {eq.treble > 0 ? '+' : ''}{eq.treble} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={eq.treble}
                onChange={(e) => handleBandChange('treble', parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((eq.treble + 12) / 24) * 100}%, #374151 ${((eq.treble + 12) / 24) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-12 dB</span>
                <span>0 dB</span>
                <span>+12 dB</span>
              </div>
            </div>
          </div>

          {/* Current Preset */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Current Preset:</span>
              <span className="text-xl font-semibold text-green-400">
                {eq.preset}
              </span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">💡 Tips</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• <strong>Bass (60-250 Hz):</strong> Adds depth and warmth to music</li>
            <li>• <strong>Mid (250-4000 Hz):</strong> Enhances vocals and instruments</li>
            <li>• <strong>Treble (4000-16000 Hz):</strong> Increases clarity and brightness</li>
            <li>• <strong>Rock:</strong> Punchy bass and bright highs for energy</li>
            <li>• <strong>Classical:</strong> Balanced with emphasis on highs for clarity</li>
            <li>• <strong>Flat:</strong> No EQ adjustment - natural sound</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
