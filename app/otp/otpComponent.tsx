import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText'; // Adjust based on your project structure

interface OtpInputProps {
  otpDigits: string[];
  otpError: string;
  timer: number;
  isResendEnabled: boolean;
  verifyOtpButtonLoading: boolean;
  setOtpDigits: (digits: string[]) => void;
  setOtp: (otp: string) => void;
  handleOtpSubmit: (otp: string) => Promise<boolean>;
  handleResendOtp: () => void;
  phoneNumber: string;
  userName: string;
}

export default function OtpInput({
  otpDigits,
  otpError,
  timer,
  isResendEnabled,
  verifyOtpButtonLoading,
  setOtpDigits,
  setOtp,
  handleOtpSubmit,
  handleResendOtp,
  phoneNumber,
  userName,
}: OtpInputProps) {
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [whatsAppSent, setWhatsAppSent] = useState(false);

  // Initialize refs for each OTP input
  otpInputRefs.current = otpDigits.map(
    (_, i) => otpInputRefs.current[i] ?? React.createRef<TextInput>()
  );

  const notifyUser = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) return;
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = text;
    setOtpDigits(newOtpDigits);
    setOtp(newOtpDigits.join(''));
    if (text && index < otpDigits.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    Keyboard.dismiss();
    handleResendOtp();
    setWhatsAppSent(false);
  };

  const sendOtpSuccessWhatsAppMessage = async () => {
    console.log("whatsappp is set ready ");
    try {
      const whatsAppUrl = 'https://app2.cunnekt.com/v1/sendnotification';
      // Use environment variable for API key in production
      const api_key = process.env.WHATSAPP_API_KEY || '3115c6ff026625317b9df24d692570ecab70ffb1';

      const messagePayload = {
        mobile: `91${phoneNumber}`,
        templateid: '1207184657851670',
        overridebot: 'no',
        // Assuming the template supports parameters for userName
        parameters: {
          userName,
        },
      };

      const response = await fetch(whatsAppUrl, {
        method: 'POST',
        headers: {
          'API-KEY': api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const result = await response.json();
console.log("📦 WhatsApp API Response:", result);

    if (response.ok) {
      
      return true;
    } else {
      console.error('❌ WhatsApp message failed:', result);
      notifyUser('Failed to send WhatsApp confirmation.');
      return false;
    }

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      notifyUser('Error sending WhatsApp confirmation.');
      return false;
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    const success = await handleOtpSubmit(otp);
    console.log('✅ OTP Verification Result:', success);

   if (success) {
      console.log("✅ OTP verified successfully.");
      if (!whatsAppSent) {
        const sent = await sendOtpSuccessWhatsAppMessage();
        console.log("📨 WhatsApp message sent?", sent);
        if (sent) {
          setWhatsAppSent(true);
        }
      } else {
        console.log("ℹ️ WhatsApp message already sent.");
      }
    } else {
      notifyUser('OTP verification failed. Please try again.');
      console.log("❌ OTP verification failed.");
    }

  };

  return (
    <>
      <View style={styles.otpContainer}>
        {otpDigits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (otpInputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            maxLength={1}
            keyboardType="numeric"
            textAlign="center"
            autoComplete="off"
            textContentType="none"
            autoCapitalize="none"
          />
        ))}
      </View>

      {otpError?.trim() !== '' && (
        <ThemedText type="defaultSemiBold" style={styles.errorText}>
          {otpError}
        </ThemedText>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#000' }]}
          onPress={handleVerifyOtp}
          disabled={verifyOtpButtonLoading}
          activeOpacity={0.7}
        >
          {verifyOtpButtonLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Verify OTP
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResend}
        disabled={!isResendEnabled}
        activeOpacity={0.7}
      >
        <ThemedText type="default" style={styles.resendButtonText}>
          Resend OTP {isResendEnabled ? '' : `in (${timer}s)`}
        </ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 15,
  },
  otpInput: {
    width: 55,
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontFamily: 'Kanchenjunga',
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 60,
    elevation: 2,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resendButton: {
    paddingHorizontal: 20,
    marginBottom: 30,
    width: 250,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgb(249, 74, 74)',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },
});