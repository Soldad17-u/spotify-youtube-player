import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { searchTracks, playTrack, addToQueue } from '../api/client';
import type { Track } from '../types';

const HomeScreen = () => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await searchTracks(query);
      setTracks(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (trackId: string) => {
    try {
      await playTrack(trackId);
    } catch (err) {
      console.error('Play failed:', err);
    }
  };

  const handleAddToQueue = async (trackId: string) => {
    try {
      await addToQueue(trackId);
    } catch (err) {
      console.error('Add to queue failed:', err);
    }
  };

  const renderTrack = ({ item }: { item: Track }) => {
    const albumArt = item.album.images[0]?.url;
    const artistNames = item.artists.map((a) => a.name).join(', ');
    const durationMin = Math.floor(item.duration_ms / 60000);
    const durationSec = Math.floor((item.duration_ms % 60000) / 1000);

    return (
      <View style={styles.trackItem}>
        {albumArt && (
          <Image source={{ uri: albumArt }} style={styles.albumArt} />
        )}
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {artistNames}
          </Text>
          <Text style={styles.trackDuration}>
            {durationMin}:{durationSec.toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.trackActions}>
          <TouchableOpacity
            onPress={() => handlePlay(item.id)}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>▶️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleAddToQueue(item.id)}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tracks..."
          placeholderTextColor="#B3B3B3"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? '⏳' : '🔍'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && tracks.length === 0 ? (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      ) : tracks.length > 0 ? (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrack}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Search for your favorite music</Text>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#282828',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 24,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#1DB954',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  list: {
    padding: 16,
  },
  trackItem: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
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
    marginBottom: 2,
  },
  trackDuration: {
    color: '#B3B3B3',
    fontSize: 12,
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
  },
  actionIcon: {
    fontSize: 20,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#B3B3B3',
    fontSize: 16,
  },
});

export default HomeScreen;