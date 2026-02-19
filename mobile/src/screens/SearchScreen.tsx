import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from 'react-native';
import { playerAPI } from '../api/client';
import { colors, spacing } from '../theme/colors';
import SearchBar from '../components/SearchBar';
import TrackItem from '../components/TrackItem';

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await playerAPI.search(query);
      setResults(response.data.tracks || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePlayTrack = async (trackId: string) => {
    try {
      await playerAPI.play(trackId);
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const handleAddToQueue = async (trackId: string) => {
    try {
      await playerAPI.addToQueue(trackId);
    } catch (error) {
      console.error('Queue error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar onSearch={handleSearch} />
      </View>

      {searching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackItem
              track={item}
              onPlay={() => handlePlayTrack(item.id)}
              onAddToQueue={() => handleAddToQueue(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>🔍 Search for music</Text>
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
  searchContainer: {
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
    fontSize: 18,
    color: colors.textSecondary,
  },
});

export default SearchScreen;