import React, { useRef } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Keyboard } from 'react-native';

interface OtpInputProps {
  otpDigits: string[];
  setOtpDigits: (digits: string[]) => void;
  setOtp: (otp: string) => void;
  otpError: string;
  handleOtpSubmit: () => void;
  handleResendOtp: () => void;
  timer: number;
  isResendEnabled: boolean;
  verifyOtpButtonLoading: boolean;
}

export default function OtpInput({
  otpDigits,
  setOtpDigits,
  setOtp,
  otpError,
  handleOtpSubmit,
  handleResendOtp,
  timer,
  isResendEnabled,
  verifyOtpButtonLoading,
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

  const handleVerifySubmit = () => {
    Keyboard.dismiss();
    handleOtpSubmit();
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

      {/* error section */}
      {otpError && otpError !== ' ' ? (
        <Text style={styles.errorText}>{otpError}</Text>
      ) : null}

      {/* verify otp button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#000' }]} 
          onPress={handleVerifySubmit}
          disabled={verifyOtpButtonLoading}
        >
          {verifyOtpButtonLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* resend otp */}
      <TouchableOpacity
        style={[styles.resendButton]}
        onPress={handleResend}
        disabled={!isResendEnabled}
      >
        <Text style={styles.resendButtonText}>
          Resend OTP {isResendEnabled ? '' : `in (${timer}s)`}
        </Text>
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
    fontFamily: 'Quicksand',
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
    fontFamily: 'Quicksand',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resendButton: {
    // paddingVertical: 4,
    paddingHorizontal: 20,
    marginBottom: 30,
    width: 250,
  },
  resendButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Quicksand',
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgb(249, 74, 74)',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },
});