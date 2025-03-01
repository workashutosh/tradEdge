import { View, Text, useColorScheme, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
// import { styles } from './stocks'

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
    gradientEnd: isDark ? '#121212' : '#f7f7f7'
  };

  const handleLogout=async()=>{
    try {
      // Retrieve session_id and access_token from AsyncStorage
      const sessionId = await AsyncStorage.getItem('session_id');
      const accessToken = await AsyncStorage.getItem('access_token');

      // if (sessionId && accessToken) {
      //   // Make DELETE request to logout endpoint
      //   await axios.delete(
      //     `https://kyclogin.twmresearchalert.com/session/logout?session=${sessionId}`
      //     );
      // }

      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      router.replace('/login'); // Redirect to login
    } catch (error) {
      Alert.alert('Logout Failed', error.response?.data?.messages?.[0] || 'An error occurred');
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.backgroundDark : styles.backgroundLight]}>
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>

        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Profile</Text>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, {color:colors.text}]}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      </ScrollView>
    </SafeAreaView>
  )
}

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
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  count: {
    color: '#666',
    fontWeight: '400',
  },
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  logoutButton: {
    // width: 50,
    fontSize: 20,
    height: 30,
    paddingHorizontal: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  textDark: {
    color: '#ffffff',
  },
});