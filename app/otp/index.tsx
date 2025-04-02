import { View, Text, Dimensions, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Modal from 'react-native-modal';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Quicksand_400Regular } from '@expo-google-fonts/quicksand';
import PhoneInput from './phoneComponent';
import OtpInput from './otpComponent';
import UserDetails from './userDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { TouchableWithoutFeedback } from 'react-native';

export default function OtpLogin() {
  const router = useRouter();
  const { handleLogin } = useAuth();

  const [phone, setPhone] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  const [otp, setOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [verificationId, setVerificationId] = useState<string>('');
  const [showOtpField, setShowOtpField] = useState<boolean>(false);
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [isResendEnabled, setIsResendEnabled] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
  const [phoneError, setPhoneError] = useState<string>(' ');
  const [otpError, setOtpError] = useState<string>(' ');
  const [userDetailsError, setUserDetailsError] = useState<string>(' ');
  const [otpButtonLoading, setOtpButtonLoading] = useState<boolean>(false);
  const [continueButtonLoading, setContinueButtonLoading] = useState<boolean>(false);
  const [verifyOtpButtonLoading, setVerifyOtpButtonLoading] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({ Quicksand: Quicksand_400Regular });
  const dimHeight=Dimensions.get('window').height;
  const os=Platform.OS;

  useEffect(() => {
    if (showOtpField && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsResendEnabled(true);
    }
  }, [showOtpField, timer]);

  const handlePhoneError = (msg: string) => {
    setPhoneError('Please enter a valid Indian phone number');
    setTimeout(() => setPhoneError(' '), 5000);
  };

  const handleOtpError = (msg: string) => {
    setOtpError(msg);
    setTimeout(() => setOtpError(' '), 5000);
  };

  const handleUserDetailsError = (msg: string) => {
    setUserDetailsError(msg);
    setTimeout(() => setUserDetailsError(' '), 5000);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss(); // Explicitly dismiss keyboard
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    
    if (!phone || !indianPhoneRegex.test(phone)) {
      handlePhoneError('Please enter a valid Indian phone number');
      return;
    }

    setOtpButtonLoading(true);
    try {
      const response = await fetch(`https://kyclogin.twmresearchalert.com/session?number=${phone}`);
      
      if (response.status === 200) {
        const responseData = await response.json();
        const { data, messages } = responseData;
        
        if (data && messages && messages[0] === "OTP Sent") {
          setVerificationId(data.verificationId);
          setShowOtpField(true);
        }
      } else if (response.status === 403) {
        setShowUserDetails(true);
      } else {
        handlePhoneError('Something went wrong. Please try again.');
      }
    } catch (error) {
      handlePhoneError('Failed to send OTP. Please try again.');
    }
    setOtpButtonLoading(false);
  };

  const handleOtpSubmit = async () => {
    Keyboard.dismiss(); // Explicitly dismiss keyboard
    if (otp.length !== 4) {
      handleOtpError('Please enter a valid 4-digit OTP');
      return;
    }

    setVerifyOtpButtonLoading(true);
    try {
      const response = await axios.post(`https://kyclogin.twmresearchalert.com/session`, {
        number: phone,
        otp: otp,
        platform: 'mobile',
        verificationId: verificationId,
      });
      handleLogin(response.data.data, router);
    } catch (error) {
      handleOtpError('Please check OTP and try again');
    }
    setVerifyOtpButtonLoading(false);
  };

  const handleResendOtp = () => {
    Keyboard.dismiss(); // Explicitly dismiss keyboard
    setShowOtpField(false);
    setOtp('');
    setOtpDigits(['', '', '', '']);
    setTimer(30);
    setIsResendEnabled(false);
    setPhoneError(' ');
  };

  const handleUserDetailsSubmit = async () => {
    Keyboard.dismiss(); // Explicitly dismiss keyboard
    setContinueButtonLoading(true);
    const payload = {
      user_full_name: userName,
      user_whatsapp_number: phone,
      user_alternate_number: phone,
      user_email_id: userEmail,
      user_position: 3,
      user_active: 'Y',
    };

    try {
      const createUserResponse = await axios.put('https://gateway.twmresearchalert.com/kyc', payload);
      if (createUserResponse.status === 200) {
        await AsyncStorage.setItem('user_id', createUserResponse.data.data.user_id);
      }

      const response = await fetch(`https://kyclogin.twmresearchalert.com/session?number=${phone}`);
      if (response.status === 200) {
        const responseData = await response.json();
        const { data, messages } = responseData;
        if (data && messages && messages[0] === 'OTP Sent') {
          setVerificationId(data.verificationId);
          setShowOtpField(true);
          setShowUserDetails(false);
        }
      } else if (response.status === 400) {
        handleUserDetailsError('Email already exists');
      }
    } catch (error) {
      handleUserDetailsError('Email already exists');
    } finally {
      setContinueButtonLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="always" // Changed to 'always' for better tap handling
        >
          <View style={[{ flexDirection: 'column', alignItems: 'center', paddingTop: 40 }]}>
            <Image source={require('../../assets/images/logo.png')} style={[styles.logo]} />
            <View style={[{ alignItems: 'center' }]}>
              <Text style={{ fontSize: 40, fontFamily: 'Quicksand', fontWeight: 'bold' }}>
                <Text style={{ color: '#4666C8' }}>Hey</Text> There!
              </Text>
              <Text style={{ fontSize: 30, fontFamily: 'Quicksand' }}>
                Welcome to <Text style={{ fontWeight: 'bold', color: '#4666C8' }}>Tradedge</Text>
              </Text>
              <Text style={{ fontSize: 30, fontFamily: 'Quicksand' }}>
                Get <Text style={{ fontWeight: 'bold', color: '#4666C8' }}>3 Free</Text> trades
              </Text>
            </View>
          </View>
    
          <Modal 
            isVisible={isModalVisible} 
            animationIn="slideInUp" 
            hasBackdrop={false} 
            avoidKeyboard={true}
            style={{ width: '100%', margin: 0 }}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <View style={{ 
                height: showUserDetails ? (os==='ios'? dimHeight * 0.45: dimHeight * 0.5) 
                                        : (os==='ios'? dimHeight * 0.38: dimHeight * 0.42), 
                width: '100%' 
              }}>
                <LinearGradient
                  colors={['#3828B2', '#4A6FE9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    borderTopRightRadius: 30,
                    borderTopLeftRadius: 30,
                    paddingHorizontal: 20,
                    paddingTop: 30,
                  }}
                >
                  <Text style={styles.title}>Let's Get Started</Text>
                  <Text style={styles.subtitle}>Follow Simple steps to get into Tradege</Text>
    
                  {showUserDetails ? (
                    <UserDetails
                      onSubmit={handleUserDetailsSubmit}
                      userName={userName}
                      setUserName={setUserName}
                      userEmail={userEmail}
                      setUserEmail={setUserEmail}
                      continueButtonLoading={continueButtonLoading}
                      userDetailsError={userDetailsError}
                    />
                  ) : showOtpField ? (
                    <OtpInput
                      otpDigits={otpDigits}
                      setOtpDigits={setOtpDigits}
                      setOtp={setOtp}
                      otpError={otpError}
                      handleOtpSubmit={handleOtpSubmit}
                      handleResendOtp={handleResendOtp}
                      timer={timer}
                      isResendEnabled={isResendEnabled}
                      verifyOtpButtonLoading={verifyOtpButtonLoading}
                    />
                  ) : (
                    <PhoneInput
                      phone={phone}
                      setPhone={setPhone}
                      phoneError={phoneError}
                      handleSubmit={handleSubmit}
                      otpButtonLoading={otpButtonLoading}
                    />
                  )}
    
                  <Text style={styles.footerText}>
                    Verified by <Text style={[{ fontWeight: 'bold' }]}>1 lakh+</Text> customers
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
    marginBottom: 0,
  },
  title: {
    fontFamily: 'Quicksand',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: 'Quicksand',
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  footerText: {
    textAlign: 'center',
    fontFamily: 'Quicksand',
    fontSize: 12,
    color: '#fff',
    position: 'absolute',
    bottom: 25,
    paddingHorizontal: 10,
  },
});