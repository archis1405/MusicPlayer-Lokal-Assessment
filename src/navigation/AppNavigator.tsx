import React from 'react';
import { View, StyleSheet , Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { FavouritesScreen } from '../screens/FavouritesScreen';
import { PlaylistsScreen } from '../screens/PlayListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

import { RootStackParamList, BottomTabParamList } from '../types';
import { colors } from '../theme';
import { usePlayerStore } from '../store/playerStore';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabIcon = ({ name, label, focused }: {
  name: keyof typeof Feather.glyphMap; label: string; focused: boolean;
}) => (
  <View style={tabIconStyles.wrap}>
    <Feather name={name} size={22} color={focused ? colors.primary : colors.textMuted} />
    <Text style={[tabIconStyles.label, focused && tabIconStyles.labelActive]}>{label}</Text>
  </View>
);

const tabIconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  labelActive: { color: colors.primary, fontWeight: '700' },
});

function MainTabs() {
  const currentSong = usePlayerStore((s) => s.currentSong);

  return (
    <View style={styles.tabsContainer}>
      <View style={styles.tabContent}>
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}>
          <Tab.Screen name="Home" component={HomeScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} /> }} />
          <Tab.Screen name="Favourites" component={FavouritesScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon name="heart" label="Favourites" focused={focused} /> }} />
          <Tab.Screen name="Playlists" component={PlaylistsScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon name="list" label="Playlists" focused={focused} /> }} />
          <Tab.Screen name="Settings" component={SettingsScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon name="settings" label="Settings" focused={focused} /> }} />
        </Tab.Navigator>
      </View>
      {currentSong && <MiniPlayer />}
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />

        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />

        <Stack.Screen name="Queue" component={QueueScreen} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.surfaceElevated,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 4,
    paddingTop: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});