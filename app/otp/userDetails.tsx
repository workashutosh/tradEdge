import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { Keyboard } from 'react-native';
import { useRouter } from 'expo-router';

interface UserDetailsProps {
  userName: string;
  userEmail: string;
  referrerCode: string;
  userDetailsError: string;
  continueButtonLoading: boolean;
  onSubmit: () => void;
  setUserName: (userName: string) => void;
  setUserEmail: (userEmail: string) => void;
  setReferrerCode: (referrerCode: string) => void;
  phoneNumber: string; // ✅ add this
}

export default function UserDetails({
  onSubmit,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  referrerCode,
  setReferrerCode,
  continueButtonLoading,
  userDetailsError,
  phoneNumber, // ✅ Add this line
 }: UserDetailsProps) {
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  
  const router = useRouter();

const notifyUser = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Info', message);
  }
};


  const validateName = (userName: string): boolean => {
    return userName.trim().length > 2; // Name should be at least 3 characters
  };

  const validateEmail = (userEmail: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(userEmail);
  };

  const handleSubmit = () => {
    setNameError(" ");
    setEmailError(" ");
    let isValid = true;

    if (!validateName(userName)) {
      setNameError('Name must be at least 3 characters');
      setTimeout(() => {
        setNameError(' ');
      }, 5000);
      isValid=false;
    }

    if (!validateEmail(userEmail)) {
      setEmailError('Please enter a valid email address');
      setTimeout(() => {
        setEmailError(' ');
      }, 5000);
      isValid=false;
    }

    if (isValid) {
      onSubmit();
    }
  };

const sendWelcomeWhatsAppMessage = async () => {
  console.log("📨 Preparing to send welcome WhatsApp message...");

  try {
    const whatsAppUrl = 'https://app2.cunnekt.com/v1/sendnotification';
    const api_key = process.env.WHATSAPP_API_KEY || '3115c6ff026625317b9df24d692570ecab70ffb1';

    const payload = {
      mobile: `91${phoneNumber}`,
      templateid: '1207184657851670',
      overridebot: 'no',
      parameters: { userName },
    };

    const response = await fetch(whatsAppUrl, {
      method: 'POST',
      headers: {
        'API-KEY': api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("new user WhatsApp API Response:", result);

    if (response.ok) {
      notifyUser(` Welcome to Tradedge! WhatsApp confirmation sent to ${phoneNumber}.`);
      setWhatsAppSent(true);
      return true;
    } else {
      console.error('❌ WhatsApp error:', result);
      notifyUser('Failed to send WhatsApp confirmation.');
      return false;
    }

  } catch (error) {
    console.error('❌ WhatsApp Exception:', error);
    notifyUser('Error sending WhatsApp confirmation.');
    return false;
  }
};



  const isFormValid = validateName(userName) && validateEmail(userEmail);

const handleFormSubmit = async () => {
  Keyboard.dismiss();

  setNameError('');
  setEmailError('');
  let isValid = true;

  if (!validateName(userName)) {
    setNameError('Name must be at least 3 characters');
    setTimeout(() => setNameError(''), 5000);
    isValid = false;
  }

  if (!validateEmail(userEmail)) {
    setEmailError('Please enter a valid email address');
    setTimeout(() => setEmailError(''), 5000);
    isValid = false;
  }

  if (isValid) {
    onSubmit(); // ✅ Trigger submission logic

    // ✅ Send WhatsApp message only once
    if (!whatsAppSent) {
      const sent = await sendWelcomeWhatsAppMessage();
      if (sent) setWhatsAppSent(true);
    } else {
      console.log("ℹ️ WhatsApp already sent.");
    }

    // ✅ Optional: Redirect to home screen (if needed)
    router.replace('/(tabs)/home');
  }
};



  return (
    <View style={{ width: '100%' }}>
      <TextInput
        style={styles.textInput}
        placeholder="Enter Your Name"
        placeholderTextColor="#999"
        value={userName}
        onChangeText={setUserName}
        editable={!continueButtonLoading}

      />
      {/* Name error */}
      <Text style={styles.errorText}>{nameError ? nameError:' '}</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Enter Your Email"
        placeholderTextColor="#999"
        value={userEmail}
        onChangeText={setUserEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!continueButtonLoading}

      />
      {/* Email error */}
      <Text style={styles.errorText}>{emailError ? emailError:' '}</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Enter Referral Code (Optional)"
        placeholderTextColor="#999"
        value={referrerCode}
        onChangeText={setReferrerCode}
        keyboardType="default"
        autoCapitalize="none"
        editable={!continueButtonLoading}

      />
      {/* Referrer error */}
      <Text style={styles.errorText}>{emailError ? emailError:' '}</Text>

      {/* error section */}
      {userDetailsError && userDetailsError !== ' ' ? (
        <Text style={styles.errorText}>{userDetailsError}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isFormValid ? '#000' : '#808080' }]}
        onPress={handleFormSubmit}
        disabled={continueButtonLoading}
        activeOpacity={0.7}
      >
        {continueButtonLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 5,
    width: '100%',
    height: 50,
    fontFamily: 'Kanchenjunga',
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 15,
    elevation: 2,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 60,
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'Kanchenjunga',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    fontFamily: 'Kanchenjunga',
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgb(249, 74, 74)',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },
});