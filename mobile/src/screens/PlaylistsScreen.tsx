import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { searchTracks, addToQueue, playTrack } from '../api/client';
import type { Track } from '../types';

const SAMPLE_PLAYLISTS = [
  { id: '1', name: '🔥 Hot Hits', query: 'top hits 2026' },
  { id: '2', name: '🎸 Rock Classics', query: 'rock classic' },
  { id: '3', name: '🎵 Chill Vibes', query: 'chill music' },
  { id: '4', name: '💪 Workout', query: 'workout music' },
  { id: '5', name: '🎹 Jazz & Blues', query: 'jazz blues' },
  { id: '6', name: '🎤 Pop Anthems', query: 'pop hits' },
];

const PlaylistsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  const loadPlaylist = async (playlistId: string, query: string) => {
    setLoading(true);
    setSelectedPlaylist(playlistId);
    try {
      const results = await searchTracks(query);
      setTracks(results);
    } catch (err) {
      console.error('Failed to load playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (trackId: string) => {
    try {
      await playTrack(trackId);
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const handleAddToQueue = async (trackId: string) => {
    try {
      await addToQueue(trackId);
    } catch (err) {
      console.error('Failed to add to queue:', err);
    }
  };

  const renderPlaylist = ({ item }: { item: typeof SAMPLE_PLAYLISTS[0] }) => (
    <TouchableOpacity
      style={[
        styles.playlistCard,
        selectedPlaylist === item.id && styles.playlistCardActive,
      ]}
      onPress={() => loadPlaylist(item.id, item.query)}
    >
      <Text style={styles.playlistName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTrack = ({ item }: { item: Track }) => (
    <View style={styles.trackCard}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <View style={styles.trackActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAddToQueue(item.id)}
        >
          <Text style={styles.actionIcon}>➕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => handlePlayTrack(item.id)}
        >
          <Text style={styles.playIcon}>▶️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Playlists</Text>

      <FlatList
        data={SAMPLE_PLAYLISTS}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.playlistsList}
        contentContainerStyle={styles.playlistsContent}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      )}

      {!loading && tracks.length > 0 && (
        <FlatList
          data={tracks}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          style={styles.tracksList}
          contentContainerStyle={styles.tracksContent}
        />
      )}

      {!loading && !selectedPlaylist && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎶</Text>
          <Text style={styles.emptyText}>Select a playlist above</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 16,
    paddingTop: 60,
  },
  playlistsList: {
    maxHeight: 100,
  },
  playlistsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  playlistCard: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playlistCardActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tracksList: {
    flex: 1,
    marginTop: 16,
  },
  tracksContent: {
    padding: 16,
    gap: 8,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  trackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
  },
  actionIcon: {
    fontSize: 18,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    borderRadius: 20,
  },
  playIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#B3B3B3',
    fontSize: 18,
  },
});

export default PlaylistsScreen;
