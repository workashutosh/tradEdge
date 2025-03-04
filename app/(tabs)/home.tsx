import { Image, StyleSheet, Platform, TouchableOpacity, useColorScheme, Modal, View, Dimensions } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Star, UserCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [username, setUsername] = useState('User'); // State for username
  const [isBuyProModalVisible, setIsBuyProModalVisible] = useState(false); // State for modal visibility
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
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

  // Load username from AsyncStorage on mount
  React.useEffect(() => {
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
    <>
      {/* Fixed Header */}
      <ThemedView style={[styles.fixedHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ThemedView style={[styles.profileContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.navigate('profile')}>
            <UserCircle2 size={30} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.greetingText, { color: colors.text }]}>Hi, {username}</ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={[styles.buyProButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsBuyProModalVisible(true)} // Show modal on click
        >
          <Star size={16} color={colors.warning} fill={colors.warning} style={styles.starIcon} />
          <ThemedText style={styles.buyProText}>Buy Pro</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Parallax Scroll Content */}
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image source={require('../../assets/images/react-logo.png')} style={styles.reactLogo} />
        }>
        <ThemedView style={[styles.titleContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="title" style={{ color: colors.text }}>Welcome!</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={[styles.stepContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>Step 1: Try it</ThemedText>
          <ThemedText style={{ color: colors.text }}>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
            Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({ ios: 'cmd + d', android: 'cmd + m', web: 'F12' })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.stepContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>Step 2: Explore</ThemedText>
          <ThemedText style={{ color: colors.text }}>
            Tap the Explore tab to learn more about what's included in this starter app.
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.stepContainer, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>Step 3: Get a fresh start</ThemedText>
          <ThemedText style={{ color: colors.text }}>
            When you're ready, run{' '}
            <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
            <ThemedText type="defaultSemiBold">app-example</ThemedText>.
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>

      {/* Buy Pro Modal */}
      <Modal
        visible={isBuyProModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsBuyProModalVisible(false)} // Close on back press (Android)
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ThemedText type="title" style={[styles.modalTitle, { color: colors.text }]}>
              Upgrade to Pro
            </ThemedText>
            <ThemedText style={[styles.modalText, { color: colors.text }]}>
              Unlock premium features with a Pro subscription! Enjoy exclusive content, advanced tools, and more.
            </ThemedText>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsBuyProModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  modalContent: {
    height: Dimensions.get('window').height * 0.6, // 3/5 of screen height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});