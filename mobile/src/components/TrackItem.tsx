import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../theme/colors';
import { formatTime } from '../utils/format';

interface Track {
  id: string;
  name: string;
  artist?: string;
  artists?: { name: string }[];
  album?: { name: string; images: { url: string }[] };
  album_art?: string;
  duration?: number;
  duration_ms?: number;
}

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
  onAddToQueue: () => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, onPlay, onAddToQueue }) => {
  const albumArt = track.album_art || track.album?.images[0]?.url;
  const artist = track.artist || track.artists?.[0]?.name || 'Unknown';
  const duration = track.duration || (track.duration_ms ? track.duration_ms / 1000 : 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPlay} style={styles.content}>
        {albumArt ? (
          <Image source={{ uri: albumArt }} style={styles.albumArt} />
        ) : (
          <View style={[styles.albumArt, styles.placeholder]}>
            <Icon name="musical-notes" size={24} color={colors.textSecondary} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artist}
          </Text>
        </View>

        <Text style={styles.duration}>{formatTime(duration)}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onAddToQueue} style={styles.queueButton}>
        <Icon name="add-circle-outline" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  placeholder: {
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  artist: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  queueButton: {
    padding: spacing.sm,
  },
});

export default TrackItem;