import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaylistsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Playlists</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B3B3B3',
    fontSize: 16,
  },
});

export default PlaylistsScreen;