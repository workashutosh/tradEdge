// app/(tabs)/profile.tsx
import { View, Text, useColorScheme, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import KycComponent from '../../components/KycComponent'; // Import the component
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/context/UserContext';
import Transactions from '@/components/Transactions';
import { useTheme } from '@/utils/theme';

export default function Profile() {

  const theme = useTheme();
  const { userDetails } = useUser();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title={"Hi " + (userDetails?.user_full_name || "User")} showLogoutButton={true} />
      <KycComponent />
      <Transactions />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});