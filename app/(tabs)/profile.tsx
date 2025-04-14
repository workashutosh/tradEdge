// app/(tabs)/profile.tsx
import { View, Text, useColorScheme, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KycComponent from '../../components/KycComponent'; // Import the component
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
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

  // kys status
  const [isKycDone, setIsKycDone] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  // handle logout
  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/otp');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.backgroundDark : styles.backgroundLight]}>
      <View style={[styles.header]}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Profile</Text>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: "white" }]}>
            Logout
          </Text>
          <FontAwesome name="sign-out" size={16} color="white" style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Other profile content can go here */}
        <KycComponent />
        {/* <Text>Hello</Text> */}
        <ThemedView style={[{paddingBottom: 70, backgroundColor: colors.background}]}>
          
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundLight: {
    backgroundColor: '#f5f7fa',
  },
  backgroundDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  textDark: {
    color: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    borderRadius: 5,
    justifyContent: 'center',
    height: 30,
  },
  logoutButtonText: {
    fontSize: 16,
    // alignSelf: 'center'
  },
  logoutIcon: {
    marginLeft: 5,
  },
});