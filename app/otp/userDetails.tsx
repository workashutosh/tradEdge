import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Keyboard } from 'react-native';

interface UserDetailsProps {
  onSubmit: () => void;
  userName: string;
  setUserName: (userName: string)=>void;
  userEmail: string;
  setUserEmail: (userEmail: string)=>void;
  continueButtonLoading: boolean;
  userDetailsError: string;
}

export default function UserDetails({
  onSubmit,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  continueButtonLoading,
  userDetailsError,
  
 }: UserDetailsProps) {
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

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

  const isFormValid = validateName(userName) && validateEmail(userEmail);

  const handleFormSubmit = () => {
    Keyboard.dismiss();
    handleSubmit();
  };

  return (
    <View style={{ width: '100%' }}>
      <TextInput
        style={styles.textInput}
        placeholder="Enter Your Name"
        placeholderTextColor="#999"
        value={userName}
        onChangeText={setUserName}
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
      />
      {/* Email error */}
      <Text style={styles.errorText}>{emailError ? emailError:' '}</Text>

      {/* error section */}
      {userDetailsError && userDetailsError !== ' ' ? (
        <Text style={styles.errorText}>{userDetailsError}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isFormValid ? '#000' : '#808080' }]}
        onPress={handleFormSubmit}
        disabled={continueButtonLoading}
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
    fontFamily: 'Quicksand',
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
    fontFamily: 'Quicksand',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
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