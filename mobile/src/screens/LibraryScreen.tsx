import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { playerAPI } from '../api/client';
import { colors, spacing } from '../theme/colors';
import TrackItem from '../components/TrackItem';

const LibraryScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await playerAPI.getFavorites();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Favorites error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (trackId: string) => {
    try {
      await playerAPI.play(trackId);
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Favorites</Text>
      
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackItem
              track={item}
              onPlay={() => handlePlayTrack(item.id)}
              onAddToQueue={() => playerAPI.addToQueue(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No favorites yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    padding: spacing.md,
  },
  list: {
    padding: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default LibraryScreen;