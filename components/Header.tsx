import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';
import BuyProButton from '@/components/BuyProButton';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/utils/theme';

interface HeaderProps {
  showBuyProButton?: boolean;
  showLogoutButton?: boolean;
  title: string;
}

export default function Header({ showBuyProButton = false, showLogoutButton = false, title }: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = useTheme();
  const colors = {
    ...themeColors,
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7',
  };

  const { userDetails, logout } = useUser();
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // handle logout
  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/otp');
  };

  return (
    <ThemedView style={[styles.header, { backgroundColor: colors.background, shadowColor: colors.text }]}>
      <ThemedView style={[styles.profileContainer, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
          <FontAwesome name="user-circle-o" size={28} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.greetingText, { color: colors.text }]}>
          {title}
        </ThemedText>
      </ThemedView>
      {showBuyProButton && (
        <>
          <BuyProButton setIsPopupVisible={setIsPopupVisible} />
          <Modal
            visible={isPopupVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setIsPopupVisible(false)}
          >
            <ThemedView style={modalStyles.overlay}>
              <ThemedView style={[modalStyles.modalContent, { backgroundColor: colors.card }]}>
                <ThemedText style={[modalStyles.modalTitle, { color: colors.text }]}>Upgrade to Pro</ThemedText>
                <ThemedText style={[modalStyles.modalText, { color: colors.text }]}>
                  Coming soon! Stay tuned for exciting features and enhancements.
                </ThemedText>
                <TouchableOpacity
                  style={[modalStyles.closeButton, { backgroundColor: colors.primary }]}
                  onPress={() => setIsPopupVisible(false)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={{ color: colors.buttonText, fontWeight: 'bold' }}>Close</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </Modal>
        </>
      )}
      {showLogoutButton && (
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.logoutButtonText, { color: "white" }]}>
            Logout
          </ThemedText>
          <FontAwesome name="sign-out" size={16} color="white" style={styles.logoutIcon} />
        </TouchableOpacity>
      )}
    </ThemedView>
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
  },
  logoutIcon: {
    marginLeft: 5,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
});