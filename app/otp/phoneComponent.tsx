import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';

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
  
  // This prevents keyboard from dismissing when clicking the button
  const onButtonPress = () => {
    // Optional: You can call this if you need to explicitly dismiss the keyboard 
    // when you submit the form after a button press.
    Keyboard.dismiss();
    handleSubmit();
  };

  const validatePhoneNumber = (value: string) => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(value);
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhone(numericValue);
  };

  return (
    <View style={{ width: '100%' }}>
      <View style={styles.inputContainer}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>+91</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Phone Number"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={handlePhoneChange}
          maxLength={10}
          keyboardType="phone-pad"
          onSubmitEditing={onButtonPress}
        />
      </View>

      {/* error section */}
      {phoneError && phoneError !== ' ' ? (
        <Text style={styles.errorText}>{phoneError}</Text>
      ) : null}

      {/* terms section */}
      <Text style={styles.termsText}>
        By Proceeding I accept all the{' '}
        <Text style={styles.termsLink}>terms and conditions</Text> of Tradege
      </Text>

      {/* get otp button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: phone.length === 10 ? '#000' : '#808080' }]}
        onPress={onButtonPress} // Ensure this doesn't dismiss the keyboard
        disabled={otpButtonLoading}
      >
        {otpButtonLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get OTP</Text>
        )}
      </TouchableOpacity>
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
    fontFamily: 'Quicksand',
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    flex: 1,
    fontFamily: 'Quicksand',
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 15,
  },
  termsText: {
    fontFamily: 'Quicksand',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#00FF00',
    textDecorationLine: 'underline',
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
  errorText: {
    fontFamily: 'Quicksand',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgb(249, 74, 74)',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },
});
