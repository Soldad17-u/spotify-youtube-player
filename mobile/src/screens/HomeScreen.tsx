import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { playerAPI, type PlayerStatus } from '../api/client';
import { colors, spacing } from '../theme/colors';
import PlayerControls from '../components/PlayerControls';
import ProgressBar from '../components/ProgressBar';

const HomeScreen = () => {
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await playerAPI.getStatus();
      setStatus(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStatus}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const track = status?.current_track;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Album Art */}
      <View style={styles.albumContainer}>
        {track?.album_art ? (
          <Image source={{ uri: track.album_art }} style={styles.albumArt} />
        ) : (
          <View style={[styles.albumArt, styles.albumPlaceholder]}>
            <Text style={styles.placeholderText}>🎵</Text>
          </View>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {track?.name || 'No track playing'}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {track?.artist || 'Select a track to play'}
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar
        position={status?.position || 0}
        duration={status?.duration || 0}
        onSeek={(pos) => playerAPI.seek(pos)}
      />

      {/* Player Controls */}
      <PlayerControls
        isPlaying={status?.is_playing || false}
        shuffle={status?.shuffle || false}
        repeat={status?.repeat || 'off'}
        onPlay={() => playerAPI.resume()}
        onPause={() => playerAPI.pause()}
        onNext={() => playerAPI.next()}
        onShuffle={() => playerAPI.toggleShuffle()}
        onRepeat={() => playerAPI.cycleRepeat()}
      />

      {/* Queue Info */}
      <View style={styles.queueInfo}>
        <Text style={styles.queueText}>
          🎶 Queue: {status?.queue_length || 0} tracks
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  albumContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 12,
  },
  albumPlaceholder: {
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  trackName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  artistName: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  queueInfo: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  queueText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  retryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;