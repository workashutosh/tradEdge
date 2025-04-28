// app/(tabs)/profile.tsx
import { View, Text, useColorScheme, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KycComponent from '../../components/KycComponent'; // Import the component
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import UserDetails from '../otp/userDetails';
import Transactions from '@/components/Transactions';

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
  const { logout, userDetails } = useAuth();
  const router = useRouter();

  // handle logout
  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/otp');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.backgroundDark : styles.backgroundLight]}>
      <Header title={"Hi "+ userDetails?.user_full_name || "User"} showLogoutButton={true}/>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Other profile content can go here */}
        <KycComponent />
        <Transactions />
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
    paddingHorizontal: 10,
  },
});