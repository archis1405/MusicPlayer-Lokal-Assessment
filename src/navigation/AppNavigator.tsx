import React from 'react';
import { View, StyleSheet } from 'react-native';
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

import { RootStackParamList, BottomTabParamList } from '../types';
import { colors } from '../theme';
import { usePlayerStore } from '../store/playerStore';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabBarIcon = ({
  name,
  focused,
}: {
  name: keyof typeof Feather.glyphMap;
  focused: boolean;
}) => (
  <View style={styles.iconContainer}>
    <Feather
      name={name}
      size={22}
      color={focused ? colors.primary : colors.textMuted}
    />
  </View>
);

function MainTabs() {
  const currentSong = usePlayerStore((s) => s.currentSong);

  return (
    <View style={styles.tabsContainer}>
      <View style={styles.tabContent}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabBarIcon name="home" focused={focused} />
              ),
            }}
          />

          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabBarIcon name="search" focused={focused} />
              ),
            }}
          />

          <Tab.Screen
            name="Library"
            component={LibraryScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabBarIcon name="book" focused={focused} />
              ),
            }}
          />
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