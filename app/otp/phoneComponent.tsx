import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText'; // Import ThemedText

interface PhoneInputProps {
  phone: string;
  setPhone: (phone: string) => void;
  phoneError: string;
  handleSubmit: () => void;
  otpButtonLoading: boolean;
}

export default function PhoneInput({
  phone,
  setPhone,
  phoneError,
  handleSubmit,
  otpButtonLoading,
}: PhoneInputProps) {
  const handlePhoneChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhone(numericValue);
  };

  return (
    <View style={{ width: '100%' }}>
      <View style={styles.inputContainer}>
        <View style={styles.countryCode}>
          <ThemedText type="default" style={styles.countryCodeText}>+91</ThemedText>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Phone Number"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={handlePhoneChange}
          maxLength={10}
          keyboardType="phone-pad"
          onSubmitEditing={handleSubmit}
          editable={!otpButtonLoading}
        />
      </View>

      {/* Error Section */}
      {phoneError && phoneError !== ' ' ? (
        <ThemedText type="defaultSemiBold" style={styles.errorText}>{phoneError}</ThemedText>
      ) : null}

      {/* Terms Section */}
      <ThemedText type="default" style={styles.termsText}>
        By Proceeding I accept all the{' '}
        <ThemedText type="link" style={styles.termsLink}>terms and conditions</ThemedText> of Tradege
      </ThemedText>

      {/* Get OTP Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: phone.length === 10 ? '#000' : '#808080' }]}
        onPress={handleSubmit}
        disabled={otpButtonLoading}
      >
        {otpButtonLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>Get OTP</ThemedText>
        )}
      </TouchableOpacity>

      {/* Footer Section */}
      <ThemedText type="default" style={styles.footerText}>
        Verified by <ThemedText type="defaultSemiBold" style={{ fontSize: 12 }}>1 lakh+</ThemedText> customers
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    height: 50,
    alignItems: 'center',
    elevation: 2,
  },
  countryCode: {
    width: 60,
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 15,
  },
  termsText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#00FF00',
    textDecorationLine: 'underline',
    fontSize: 12,
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
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgb(249, 74, 74)',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#fff',
    paddingTop: 10,
  },
});
