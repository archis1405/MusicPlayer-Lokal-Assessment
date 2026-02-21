import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, typography, borderRadius } from '../theme';

export const SettingsScreen: React.FC = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [autoPlay, setAutoPlay] = React.useState(true);
  const [highQuality, setHighQuality] = React.useState(false);

  const SettingRow = ({ icon, label, value, onToggle, onPress }: {
    icon: keyof typeof Feather.glyphMap; label: string;
    value?: boolean; onToggle?: (v: boolean) => void; onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Feather name={icon} size={20} color={colors.primary} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      {onToggle !== undefined && value !== undefined ? (
        <Switch value={value} onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
      ) : (
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Feather name="music" size={24} color={colors.primary} />
        <Text style={styles.logo}>Music Player</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Playback</Text>
        <SettingRow icon="play-circle" label="Auto Play" value={autoPlay} onToggle={setAutoPlay} />
        <SettingRow icon="volume-2" label="High Quality Audio" value={highQuality} onToggle={setHighQuality} />
        <Text style={styles.section}>General</Text>
        <SettingRow icon="bell" label="Notifications" value={notifications} onToggle={setNotifications} />
        <SettingRow icon="download" label="Download Quality" onPress={() => {}} />
        <SettingRow icon="trash-2" label="Clear Cache" onPress={() => {}} />
        <Text style={styles.section}>About</Text>
        <SettingRow icon="info" label="Version 1.0.0" />
        <SettingRow icon="github" label="Open Source" onPress={() => {}} />
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingVertical: 14 
    },
    logo: { 
        ...typography.h2, 
        color: colors.text 
    },
    section: { 
        fontSize: 11, 
        fontWeight: '700', 
        color: colors.textMuted, 
        paddingHorizontal: 20, 
        paddingTop: 24, 
        paddingBottom: 8, 
        letterSpacing: 1, 
        textTransform: 'uppercase' 
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.border 
    },
    rowIcon: { 
        marginRight: 14 
    },
    rowLabel: { 
        flex: 1, ...typography.body, 
        color: colors.text 
    },
});