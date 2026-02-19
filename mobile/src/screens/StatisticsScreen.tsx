import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';

interface Statistics {
  total_plays: number;
  unique_tracks: number;
  total_time_seconds: number;
  top_tracks: Array<{
    track_name: string;
    artist_name: string;
    play_count: number;
  }>;
  top_artists: Array<{
    artist_name: string;
    play_count: number;
  }>;
}

const StatisticsScreen = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:8000/statistics');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Statistics</Text>

      <View style={styles.overviewCards}>
        <View style={[styles.overviewCard, styles.greenCard]}>
          <Text style={styles.overviewValue}>
            {stats.total_plays.toLocaleString()}
          </Text>
          <Text style={styles.overviewLabel}>Total Plays</Text>
        </View>
        <View style={[styles.overviewCard, styles.blueCard]}>
          <Text style={styles.overviewValue}>
            {formatTime(stats.total_time_seconds)}
          </Text>
          <Text style={styles.overviewLabel}>Listening Time</Text>
        </View>
        <View style={[styles.overviewCard, styles.purpleCard]}>
          <Text style={styles.overviewValue}>{stats.unique_tracks}</Text>
          <Text style={styles.overviewLabel}>Unique Tracks</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Top Tracks</Text>
        {stats.top_tracks.slice(0, 10).map((track, index) => (
          <View key={index} style={styles.rankCard}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
            <View style={styles.rankInfo}>
              <Text style={styles.rankName} numberOfLines={1}>
                {track.track_name}
              </Text>
              <Text style={styles.rankSubtext} numberOfLines={1}>
                {track.artist_name}
              </Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{track.play_count}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎤 Top Artists</Text>
        {stats.top_artists.slice(0, 10).map((artist, index) => (
          <View key={index} style={styles.rankCard}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
            <View style={styles.artistAvatar}>
              <Text style={styles.artistInitial}>
                {artist.artist_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.rankInfo}>
              <Text style={styles.rankName} numberOfLines={1}>
                {artist.artist_name}
              </Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{artist.play_count}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.funFactsCard}>
        <Text style={styles.funFactsTitle}>✨ Fun Facts</Text>
        <Text style={styles.funFact}>
          🎶 Average of{' '}
          <Text style={styles.funFactValue}>
            {(stats.total_plays / stats.unique_tracks).toFixed(1)}
          </Text>{' '}
          plays per track
        </Text>
        <Text style={styles.funFact}>
          🔥 Most played track has{' '}
          <Text style={styles.funFactValue}>
            {stats.top_tracks[0]?.play_count || 0}
          </Text>{' '}
          plays
        </Text>
        <Text style={styles.funFact}>
          ⏱️ Total listening time:{' '}
          <Text style={styles.funFactValue}>
            {formatTime(stats.total_time_seconds)}
          </Text>
        </Text>
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
  overviewCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  greenCard: {
    backgroundColor: '#1DB954',
  },
  blueCard: {
    backgroundColor: '#3B82F6',
  },
  purpleCard: {
    backgroundColor: '#8B5CF6',
  },
  overviewValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overviewLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  rankNumber: {
    color: '#666666',
    fontSize: 18,
    fontWeight: 'bold',
    width: 32,
  },
  artistAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  artistInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rankInfo: {
    flex: 1,
    marginRight: 12,
  },
  rankName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rankSubtext: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 2,
  },
  rankBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  funFactsCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  funFactsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  funFact: {
    color: '#B3B3B3',
    fontSize: 14,
    marginBottom: 8,
  },
  funFactValue: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#B3B3B3',
    fontSize: 18,
  },
});

export default StatisticsScreen;
