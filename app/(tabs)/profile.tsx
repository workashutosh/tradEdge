import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import KycComponent from '../../components/KycComponent';
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@/context/UserContext';
import Transactions from '@/components/Transactions';
import { useTheme } from '@/utils/theme';

export default function Profile() {
  const colors = useTheme();
  const { userDetails } = useUser();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={"Hi " + (userDetails?.user_full_name || "User")} showLogoutButton={true} />
      <ScrollView
        style={{ }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={{ paddingHorizontal: 8 }}>
          <KycComponent />
        </ThemedView>
        <ThemedView style={{ padding: 16, backgroundColor: colors.background }}>
          <ThemedText style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Your Profile</ThemedText>
          <ThemedText style={{ color: colors.text, fontSize: 16, marginTop: 16 }}>Name: {userDetails?.user_full_name}</ThemedText>
          <ThemedText style={{ color: colors.text, fontSize: 16 }}>Email: {userDetails?.user_email_id}</ThemedText>
          <ThemedText style={{ color: colors.text, fontSize: 16 }}>Phone Number: {userDetails?.username}</ThemedText>
        </ThemedView>
        <View style={{ flex: 1, minHeight: 200, paddingHorizontal: 8 }}>
          <Transactions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});