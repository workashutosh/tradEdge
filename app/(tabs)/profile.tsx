// app/(tabs)/profile.tsx
import { View, Text, useColorScheme, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import KycComponent from '../../components/KycComponent'; // Import the component

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

  const [isKycDone, setIsKycDone] = useState(false);

  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const kycStatus = await AsyncStorage.getItem('kyc_done');
        setIsKycDone(kycStatus === 'true');
      } catch (error) {
        console.log('Error checking KYC status:', error);
      }
    };
    checkKycStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.messages?.[0] || 'An error occurred';
      Alert.alert('Logout Failed', errorMessage);
    }
  };

  const handleKycComplete = async () => {
    await AsyncStorage.setItem('kyc_done', 'true');
    setIsKycDone(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.backgroundDark : styles.backgroundLight]}>
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Profile</Text>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: "white" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Other profile content can go here */}
        <KycComponent isKycDone={isKycDone} onKycComplete={handleKycComplete} />
        <Text>Hello</Text>
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
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#eef1f5',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#2d2d2d',
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
    paddingHorizontal: 7,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  logoutButtonText: {
    fontSize: 16,
  },
});