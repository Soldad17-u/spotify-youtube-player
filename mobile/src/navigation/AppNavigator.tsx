import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import SearchScreen from '../screens/SearchScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import EqualizerScreen from '../screens/EqualizerScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopColor: '#1E1E1E',
          },
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#B3B3B3',
        }}
      >
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{ tabBarLabel: '🔍 Search' }}
        />
        <Tab.Screen
          name="Player"
          component={PlayerScreen}
          options={{ tabBarLabel: '▶️ Player' }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{ tabBarLabel: '🎵 Playlists' }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ tabBarLabel: '❤️ Favorites' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ tabBarLabel: '📜 History' }}
        />
        <Tab.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ tabBarLabel: '📊 Stats' }}
        />
        <Tab.Screen
          name="Equalizer"
          component={EqualizerScreen}
          options={{ tabBarLabel: '🎚️ EQ' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
