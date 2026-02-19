import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Slider,
} from 'react-native';
import {
  getStatus,
  getPosition,
  pausePlayback,
  resumePlayback,
  playNext,
  seekTo,
  toggleShuffle,
  cycleRepeat,
} from '../api/client';
import type { PlayerStatus } from '../types';

const PlayerScreen = () => {
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const [statusData, posData] = await Promise.all([
        getStatus(),
        getPosition(),
      ]);
      setStatus(statusData);
      setPosition(posData.position || 0);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load status:', err);
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (status?.is_playing) {
        await pausePlayback();
      } else {
        await resumePlayback();
      }
    } catch (err) {
      console.error('Toggle playback failed:', err);
    }
  };

  const handleNext = async () => {
    try {
      await playNext();
    } catch (err) {
      console.error('Next track failed:', err);
    }
  };

  const handleSeek = async (value: number) => {
    try {
      await seekTo(value);
      setPosition(value);
    } catch (err) {
      console.error('Seek failed:', err);
    }
  };

  const handleShuffle = async () => {
    try {
      await toggleShuffle();
    } catch (err) {
      console.error('Shuffle toggle failed:', err);
    }
  };

  const handleRepeat = async () => {
    try {
      await cycleRepeat();
    } catch (err) {
      console.error('Repeat cycle failed:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!status?.current_track) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No track playing</Text>
      </View>
    );
  }

  const { current_track } = status;

  return (
    <View style={styles.container}>
      {current_track.album_art && (
        <Image
          source={{ uri: current_track.album_art }}
          style={styles.albumArt}
        />
      )}

      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={2}>
          {current_track.name}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {current_track.artist}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={status.duration}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#3E3E3E"
          thumbTintColor="#FFFFFF"
        />
        <Text style={styles.timeText}>{formatTime(status.duration)}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={handleShuffle}
          style={styles.controlButton}
        >
          <Text style={status.shuffle ? styles.activeControl : styles.control}>
            🔀
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePlayPause}
          style={styles.playButton}
        >
          <Text style={styles.playIcon}>
            {status.is_playing ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
          <Text style={styles.control}>⏭️</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRepeat} style={styles.controlButton}>
          <Text
            style={status.repeat !== 'off' ? styles.activeControl : styles.control}
          >
            {status.repeat === 'one' ? '🔂' : '🔁'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 24,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 32,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trackName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    color: '#B3B3B3',
    fontSize: 18,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  timeText: {
    color: '#B3B3B3',
    fontSize: 12,
    width: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  control: {
    fontSize: 28,
    color: '#B3B3B3',
  },
  activeControl: {
    fontSize: 28,
    color: '#1DB954',
  },
  playIcon: {
    fontSize: 32,
  },
  emptyText: {
    color: '#B3B3B3',
    fontSize: 18,
  },
});

export default PlayerScreen;