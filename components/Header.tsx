import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import BuyProButton from '@/components/BuyProButton';
import { useUser } from '@/context/UserContext'; // Import the useUser hook

interface HeaderProps {
  showBuyProButton?: boolean; // Optional prop to control BuyProButton visibility
  showLogoutButton?: boolean;
  title: string; // Optional prop to control Logout button visibility
}

export default function Header({showBuyProButton = false, showLogoutButton = false, title }: HeaderProps) {

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

  const { userDetails, logout } = useUser(); // Access userDetails from UserContext
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Manage popup visibility state

  // handle logout
  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/otp');
  };

  return (
    <View style={[styles.header, {backgroundColor: colors.background, shadowColor: colors.text}]}>
      <ThemedView style={[styles.profileContainer, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/profile')}
        >
          <FontAwesome name="user-circle-o" size={28} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.greetingText, { color: colors.text }]}>
          {title}
        </ThemedText>
      </ThemedView>
      {showBuyProButton && <BuyProButton setIsPopupVisible={setIsPopupVisible} />}
      {showLogoutButton && (
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: "white" }]}>
            Logout
          </Text>
          <FontAwesome name="sign-out" size={16} color="white" style={styles.logoutIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 1,
    // shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  popup: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  popupText: {
    fontSize: 14,
    fontWeight: '500',
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