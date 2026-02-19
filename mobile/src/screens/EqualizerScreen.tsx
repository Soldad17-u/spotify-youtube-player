import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';

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
];

const EqualizerScreen = () => {
  const [eq, setEq] = useState<EQSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
    preset: 'Flat',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEQ();
  }, []);

  const loadEQ = async () => {
    try {
      const response = await axios.get('http://localhost:8000/equalizer');
      setEq(response.data);
    } catch (err) {
      console.error('Failed to load EQ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBandChange = async (
    band: 'bass' | 'mid' | 'treble',
    value: number
  ) => {
    setEq({ ...eq, [band]: value, preset: 'Custom' });
    try {
      await axios.post(`http://localhost:8000/equalizer/${band}/${value}`);
    } catch (err) {
      console.error(`Failed to set ${band}:`, err);
    }
  };

  const handlePreset = async (preset: typeof PRESETS[0]) => {
    setEq({
      bass: preset.bass,
      mid: preset.mid,
      treble: preset.treble,
      preset: preset.name,
    });
    try {
      await axios.post(
        `http://localhost:8000/equalizer/preset/${preset.name.toLowerCase().replace(' ', '_')}`
      );
    } catch (err) {
      console.error('Failed to apply preset:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎚️ Equalizer</Text>

      <View style={styles.presetsContainer}>
        <Text style={styles.sectionTitle}>Presets</Text>
        <View style={styles.presetsGrid}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.name}
              style={[
                styles.presetButton,
                eq.preset === preset.name && styles.presetButtonActive,
              ]}
              onPress={() => handlePreset(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  eq.preset === preset.name && styles.presetTextActive,
                ]}
              >
                {preset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.slidersContainer}>
        <Text style={styles.sectionTitle}>Manual Adjustment</Text>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: '#EF4444' }]}>
              🔊 Bass
            </Text>
            <Text style={styles.sliderValue}>
              {eq.bass > 0 ? '+' : ''}
              {eq.bass} dB
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={-12}
            maximumValue={12}
            step={1}
            value={eq.bass}
            onSlidingComplete={(value) => handleBandChange('bass', value)}
            minimumTrackTintColor="#EF4444"
            maximumTrackTintColor="#3E3E3E"
            thumbTintColor="#FFFFFF"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>-12</Text>
            <Text style={styles.sliderLabelText}>0</Text>
            <Text style={styles.sliderLabelText}>+12</Text>
          </View>
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: '#10B981' }]}>
              🎵 Mid
            </Text>
            <Text style={styles.sliderValue}>
              {eq.mid > 0 ? '+' : ''}
              {eq.mid} dB
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={-12}
            maximumValue={12}
            step={1}
            value={eq.mid}
            onSlidingComplete={(value) => handleBandChange('mid', value)}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#3E3E3E"
            thumbTintColor="#FFFFFF"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>-12</Text>
            <Text style={styles.sliderLabelText}>0</Text>
            <Text style={styles.sliderLabelText}>+12</Text>
          </View>
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: '#3B82F6' }]}>
              ✨ Treble
            </Text>
            <Text style={styles.sliderValue}>
              {eq.treble > 0 ? '+' : ''}
              {eq.treble} dB
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={-12}
            maximumValue={12}
            step={1}
            value={eq.treble}
            onSlidingComplete={(value) => handleBandChange('treble', value)}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#3E3E3E"
            thumbTintColor="#FFFFFF"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>-12</Text>
            <Text style={styles.sliderLabelText}>0</Text>
            <Text style={styles.sliderLabelText}>+12</Text>
          </View>
        </View>
      </View>

      <View style={styles.currentPresetCard}>
        <Text style={styles.currentPresetLabel}>Current Preset:</Text>
        <Text style={styles.currentPresetValue}>{eq.preset}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 16,
    paddingTop: 60,
  },
  presetsContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  presetButtonActive: {
    backgroundColor: '#1DB954',
  },
  presetText: {
    color: '#B3B3B3',
    fontSize: 14,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  slidersContainer: {
    padding: 16,
  },
  sliderSection: {
    marginBottom: 32,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    color: '#666666',
    fontSize: 12,
  },
  currentPresetCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPresetLabel: {
    color: '#B3B3B3',
    fontSize: 16,
  },
  currentPresetValue: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EqualizerScreen;
