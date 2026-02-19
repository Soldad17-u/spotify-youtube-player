import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { playTrack } from '../api/client';
import axios from 'axios';

interface HistoryTrack {
  track_id: string;
  track_name: string;
  artist_name: string;
  play_count: number;
  last_played: string;
}

const HistoryScreen = () => {
  const [history, setHistory] = useState<HistoryTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/history?limit=100');
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (trackId: string) => {
    try {
      await playTrack(trackId);
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString();
  };

  const filteredHistory = history.filter(
    (track) =>
      track.track_name.toLowerCase().includes(search.toLowerCase()) ||
      track.artist_name.toLowerCase().includes(search.toLowerCase())
  );

  const renderTrack = ({ item }: { item: HistoryTrack }) => (
    <TouchableOpacity
      style={styles.trackCard}
      onPress={() => handlePlay(item.track_id)}
    >
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {item.track_name}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist_name}
        </Text>
      </View>
      <View style={styles.trackMeta}>
        <View style={styles.playBadge}>
          <Text style={styles.playCount}>{item.play_count}</Text>
        </View>
        <Text style={styles.timeAgo}>{formatDate(item.last_played)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 History</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Tracks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {history.reduce((sum, t) => sum + t.play_count, 0)}
          </Text>
          <Text style={styles.statLabel}>Plays</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search history..."
        placeholderTextColor="#666666"
        value={search}
        onChangeText={setSearch}
      />

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>
            {search ? 'No tracks found' : 'No history yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderTrack}
          keyExtractor={(item, index) => `${item.track_id}-${index}`}
          contentContainerStyle={styles.listContent}
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  listContent: {
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
  trackMeta: {
    alignItems: 'flex-end',
  },
  playBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  playCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeAgo: {
    color: '#666666',
    fontSize: 12,
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

export default HistoryScreen;
