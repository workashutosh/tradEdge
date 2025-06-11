import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as Clipboard from 'expo-clipboard';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme, ThemeHookReturn } from "@/utils/theme"

const getStyles = (colors: ThemeHookReturn) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  referrerCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inviteText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  inviteButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  referralBox: {
    borderWidth: 1.5,
    borderColor: colors.isDarkMode ? 'transparent' : '#222',
  },
});

export default function ReferralScreen() {
  const colors: ThemeHookReturn = useTheme();
  const styles = getStyles(colors);
  const referrerCode = '3M60AVJSWTN9';

  const handleCopyCode = () => {
    Clipboard.setStringAsync(referrerCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard.');
  };

  const handleInviteFriends = () => {
   const message = `Download Tradedge app. Use my referral code *${referrerCode}*`;
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on your device.');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/refer.png')} // Replace with your image path
          style={styles.image}
        />
      </View>

      <ThemedText type="subtitle" style={[styles.title, { color: colors.text, fontWeight: 'bold' }]}>
        Refer your friend
      </ThemedText>
      <ThemedText type="default" style={[styles.subtitle, { color: colors.text }]}>
        Share this code with your friend and help them discover Tradedge!
      </ThemedText>

      <View style={[
        styles.referralCodeContainer,
        {
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: colors.isDarkMode ? 'transparent' : '#222',
        },
      ]}>
        <ThemedText type="defaultSemiBold" style={[styles.referrerCode, { color: colors.text }]}>
          {referrerCode}
        </ThemedText>
        <TouchableOpacity onPress={handleCopyCode} 
          activeOpacity={0.7}
        >
          <MaterialIcons name="content-copy" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ThemedText type="default" style={[styles.inviteText, { color: colors.text }]}>
        Invite your friends to join and grow together.
      </ThemedText>

      <TouchableOpacity
        style={[styles.inviteButton, { backgroundColor: colors.primary }]}
        onPress={handleInviteFriends}
        activeOpacity={0.7}
      >
        <ThemedText type="defaultSemiBold" style={styles.inviteButtonText}>
          Invite Friends
        </ThemedText>
      </TouchableOpacity>

      <View style={[
        styles.statsCard,
        {
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: colors.isDarkMode ? 'transparent' : '#222',
        },
      ]}>
        <View style={styles.statItem}>
          <ThemedText type="subtitle" style={[styles.statLabel, { color: colors.text }]}>
            Total Referral Count
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.text }]}>
            0
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="subtitle" style={[styles.statLabel, { color: colors.text }]}>
            Subscription Count
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.text }]}>
            0
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}