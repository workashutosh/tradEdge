import { Image, StyleSheet, Platform, TouchableOpacity, useColorScheme, SafeAreaView, View } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useEffect } from 'react';
import { Star, UserCircle2 } from 'lucide-react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuyProPopup } from '@/components/BuyProPopup'; // Import the popup

export default function HomeScreen() {
  const [username, setUsername] = useState('User');
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Add popup state
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    headerBackground: isDark ? '#1e1e1e' : '#ffffff',
    headerBorderBottom: isDark ? '#2d2d2d' : '#eef1f5',
    text: isDark ? '#ffffff' : '#333333',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    error: '#ff4444',
    primary: '#6200ee',
    success: '#00c853',
    warning: '#ffab00',
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7',
  };

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('user_name');
        if (storedUsername) setUsername(storedUsername);
      } catch (error) {
        console.log('Error loading username:', error);
      }
    };
    loadUsername();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <View
        style={[styles.fixedHeader, isDark ? styles.headerDark : styles.headerLight]}
      >
        <ThemedView style={[styles.profileContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
            {/* <UserCircle2 size={30} color={colors.text} /> */}
            <FontAwesome name="user-circle-o" size={28} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.greetingText, { color: colors.text }]}>
            Hi, {username}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={[styles.buyProButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsPopupVisible(true)} // Open popup
        >
          <Star size={16} color={colors.warning} fill={colors.warning} style={styles.starIcon} />
          <ThemedText style={styles.buyProText}>Buy Pro</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Parallax Scroll Content */}
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={<Image source={require('../../assets/images/react-logo.png')} style={styles.reactLogo} />}
      >
        <ThemedView style={[styles.titleContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="title" style={{ color: colors.text }}>
            Welcome!
          </ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={[styles.stepContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Step 1: Try it
          </ThemedText>
          <ThemedText style={{ color: colors.text }}>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes. Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({ ios: 'cmd + d', android: 'cmd + m', web: 'F12' })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.stepContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Step 2: Explore
          </ThemedText>
          <ThemedText style={{ color: colors.text }}>
            Tap the Explore tab to learn more about what's included in this starter app.
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.stepContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Step 3: Get a fresh start
          </ThemedText>
          <ThemedText style={{ color: colors.text }}>
            When you're ready, run{' '}
            <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
            <ThemedText type="defaultSemiBold">app-example</ThemedText>.
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>

      {/* Buy Pro Popup */}
      <BuyProPopup
        visible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        colors={colors}
      />
    </SafeAreaView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#eef1f5',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#2d2d2d',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buyProButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  starIcon: {},
  buyProText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 60,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});