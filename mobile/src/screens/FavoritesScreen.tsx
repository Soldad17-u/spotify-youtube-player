import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getFavorites, playTrack } from '../api/client';
import type { Track } from '../types';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
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

  const renderTrack = ({ item }: { item: Track }) => {
    const albumArt = item.album.images[0]?.url;
    const artistNames = item.artists.map((a) => a.name).join(', ');

    return (
      <TouchableOpacity
        style={styles.trackItem}
        onPress={() => handlePlay(item.id)}
      >
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
        </View>
        <Text style={styles.playIcon}>▶️</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>❤️</Text>
          <Text style={styles.emptySubtext}>No favorites yet</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderTrack}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  playIcon: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptySubtext: {
    color: '#B3B3B3',
    fontSize: 16,
  },
});

export default FavoritesScreen;