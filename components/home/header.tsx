// app/(tabs)/home/Header.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import BuyProButton from '@/components/BuyProButton';

interface HeaderProps {
  username: string;
  colors: {
    text: string;
  };
  setIsPopupVisible: (visible: boolean) => void;
}

export default function Header({ username, colors, setIsPopupVisible }: HeaderProps) {
  return (
    <View style={styles.header}>
      <ThemedView style={[styles.profileContainer, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
          <FontAwesome name="user-circle-o" size={28} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.greetingText, { color: colors.text }]}>
          Hi, {username}
        </ThemedText>
      </ThemedView>
      <BuyProButton setIsPopupVisible={setIsPopupVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    zIndex: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});