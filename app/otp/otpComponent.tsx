import React, { useRef } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { ThemedText } from '@/components/ThemedText'; // Import ThemedText

interface OtpInputProps {
  otpDigits: string[];
  otpError: string;
  timer: number;
  isResendEnabled: boolean;
  verifyOtpButtonLoading: boolean;
  setOtpDigits: (digits: string[]) => void;
  handleOtpSubmit: () => void;
  handleResendOtp: () => void;
  setOtp: (otp: string) => void;
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
}: OtpInputProps) {
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // OTP input
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) return;
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = text;
    setOtpDigits(newOtpDigits);
    setOtp(newOtpDigits.join(''));

    if (text && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    Keyboard.dismiss();
    handleResendOtp();
  };

  return (
    <>
      {/* OTP input */}
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

      {/* Error Section */}
      {otpError && otpError !== ' ' ? (
        <ThemedText type="defaultSemiBold" style={styles.errorText}>{otpError}</ThemedText>
      ) : null}

      {/* Verify OTP Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#000' }]}
          onPress={handleOtpSubmit}
          disabled={verifyOtpButtonLoading}
        >
          {verifyOtpButtonLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>Verify OTP</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Resend OTP */}
      <TouchableOpacity
        style={[styles.resendButton]}
        onPress={handleResend}
        disabled={!isResendEnabled}
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