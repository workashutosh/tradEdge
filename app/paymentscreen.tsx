import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Platform, Animated, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/utils/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

 // ✅ Add your UPI icon

interface PaymentScreenRouteParams {
  paymentLink: string;
  packageTitle: string;
  amount: string;
}

const PaymentScreen: React.FC = () => {
  const { paymentLink, packageTitle, amount } = useLocalSearchParams() as PaymentScreenRouteParams;
  const colors = useTheme();

  const buttonScale = useRef(new Animated.Value(1)).current;
  const qrScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(qrScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleUPIPayment = async () => {
    try {
      const supported = await Linking.canOpenURL(paymentLink);
      if (supported) {
        await Linking.openURL(paymentLink);
      } else {
        Alert.alert('Error', 'No UPI app found to handle this payment.');
      }
    } catch (error) {
      console.error('Error opening UPI app:', error);
      Alert.alert('Error', 'Failed to open UPI app.');
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background || '#f5f5f5' }]}>
      <LinearGradient
        colors={['#000', '#000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          Payment for {packageTitle}
        </ThemedText>
      </LinearGradient>

      <ThemedView style={styles.content}>
        <ThemedView style={[styles.amountContainer, { backgroundColor: colors.card || '#fff', shadowColor: colors.shadowColor || '#000' }]}>
          <ThemedText style={[styles.amount, { color: '#000' }]}>
            Amount: ₹{Number(amount).toLocaleString('en-IN')}
          </ThemedText>
        </ThemedView>

        {/* Button with UPI icon */}
        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
          <LinearGradient
            colors={[colors.primary || '#6200ee', colors.vgreen || '#00c853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, { shadowColor: colors.shadowColor || '#000' }]}
          >
            <TouchableOpacity
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              onPress={handleUPIPayment}
              activeOpacity={0.8}
              style={styles.buttonContent}
              accessibilityLabel="Pay with UPI App"
            >
              <View style={styles.iconWrapper}>
                <Image
                  source={require('@/assets/images/upi.png')} // ✅ direct from src
                  style={styles.upiIcon}
                />
              </View>
              <ThemedText style={styles.buttonText}>Pay with UPI App</ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <ThemedView style={styles.orContainer}>
          <View style={[styles.divider, { backgroundColor: colors.vgreen || '#00c853' }]} />
          <ThemedText style={[styles.orText, { color: '#fff' }]}>OR</ThemedText>
          <View style={[styles.divider, { backgroundColor: colors.vgreen || '#00c853' }]} />
        </ThemedView>

        <Animated.View style={[styles.qrContainer, { backgroundColor: colors.card || '#fff', shadowColor: colors.shadowColor || '#000', transform: [{ scale: qrScale }] }]}>
          <QRCode
            value={paymentLink}
            size={220}
            backgroundColor="#fff"
            color="#000"
            logoSize={40}
            logoBackgroundColor="#fff"
            logoMargin={2}
            logoBorderRadius={10}
          />
          <ThemedText style={[styles.qrText, { color: colors.text || '#333' }]}>
            Scan this QR code with a UPI app to pay
          </ThemedText>
        </Animated.View>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  amountContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#00b300',
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '85%',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 4,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  upiIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '60%',
  },
  divider: {
    flex: 1,
    height: 2,
    marginHorizontal: 10,
  },
  orText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00c853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  qrText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PaymentScreen;
