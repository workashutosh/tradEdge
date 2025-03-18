import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
  KeyboardTypeOptions,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LOGIN_API_URL, SIGNUP_API_URL } from '@env';

const SignupScreen = () => {
  const [fullName, setFullName] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const fields = [
    {
      placeholder: 'WhatsApp Number',
      value: whatsAppNumber,
      setValue: setWhatsAppNumber,
      keyboardType: 'phone-pad',
      maxLength: 10,
      required: true,
    },
    {
      placeholder: 'Full Name',
      value: fullName,
      setValue: setFullName,
      required: true,
    },
    {
      placeholder: 'Email',
      value: email,
      setValue: setEmail,
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      required: true,
    },
    {
      placeholder: 'Password',
      value: password,
      setValue: setPassword,
      secureTextEntry: !showPassword,
      isPassword: true,
      required: true,
    },
  ];

  const validateInput = (step: number) => {
    const field = fields[step];
    const value = field.value.trim();

    if (field.required && !value) {
      return `Please enter ${field.placeholder.toLowerCase()}`;
    }

    switch (step) {
      case 0: // WhatsApp Number
        if (!/^\d{10}$/.test(value)) {
          return 'WhatsApp number must be a 10-digit number';
        }
        break;
      case 1: // Full Name
        if (value.length < 2) {
          return 'Full name must be at least 2 characters long';
        }
        break;
      case 2: // Email
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 3: // Password
        if (value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        if (!/\d/.test(value)) {
          return 'Password must contain at least one number';
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const handleNext = async () => {
    const validationError = validateInput(currentStep);
    if (validationError) {
      setErrorMessage(validationError);
      setTimeout(() => setErrorMessage(''), 3000); // Clear error after 3 seconds
      return;
    }

    if (currentStep === fields.length - 1) {
      setLoading(true);
      setErrorMessage('');
      const payload = {
        user_full_name: fullName,
        user_whatsapp_number: whatsAppNumber,
        user_alternate_number: whatsAppNumber,
        user_email_id: email,
        user_position: 1,
        user_active: 'Y',
        password: password,
      };

      try {
        // Step 1: Signup API Request
        if (!process.env.EXPO_PUBLIC_SIGNUP_URL) {
          throw new Error('Signup URL is not defined');
        }
        const response = await axios.put(process.env.EXPO_PUBLIC_SIGNUP_URL, payload);
        Alert.alert('Success', 'Account created successfully! Logging you in...');

        const loginPayload = {
          number: whatsAppNumber,
          password: password,
          platform: 'mobile',
        };

        try {
          // Step 3: Login API Request
          const loginResponse = await axios.post(
            process.env.EXPO_PUBLIC_LOGIN_URL || '',
            loginPayload
          );

          const loginData = loginResponse.data.data;
          
          const userId = loginData.user_id.replace('LNUSR', '');

          await AsyncStorage.setItem('access_token', loginData.access_token);
          await AsyncStorage.setItem('refresh_token', loginData.refresh_token);
          await AsyncStorage.setItem('user_id', userId);
          await AsyncStorage.setItem('user_name', loginData.user_name);

          router.replace('/home');
        } catch (loginError) {
          setErrorMessage('Auto-login failed. Please log in manually.');
          setTimeout(() => {
            setErrorMessage('');
            router.replace('/login');
          }, 2000);
        }
      } catch (error: any) {
        if (
          error?.response?.data?.status === 'error' &&
          (
            error.response.data.message === 'WhatsApp number already exists' ||
            error.response.data.message === 'WhatsApp number already exists and Email already exists'
          )
        ) {
          setErrorMessage('WhatsApp number already exists! Try logging in.');
          setTimeout(() => {
            setErrorMessage('');
            router.replace('/login');
          }, 2000);
        } else if (
          error?.response?.data?.status === 'error' &&
          error.response.data.message === 'Email already exists'
        ) {
          setErrorMessage('Email already exists!');
          setTimeout(() => {
            setErrorMessage('');
            setCurrentStep(2);
          }, 2000);
        } else {
          setErrorMessage('An unexpected error occurred.');
          setTimeout(() => setErrorMessage(''), 2000);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('');
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setErrorMessage('');
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <LinearGradient colors={['#306ee8', '#306ee8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            <Text style={[styles.title, { fontFamily: 'San Francisco', color: '#306ee9', marginLeft: 10 }]}>
              TradEdge
            </Text>
          </View>

          <Text style={[styles.title, { fontFamily: 'San Francisco' }]}>
            Join Now to Get <Text style={{ color: '#306ee9' }}>3 Free Trades</Text>
          </Text>

          <Text style={styles.subtitle}>
            Equity | Futures | Options | Commodities
          </Text>

          <Text style={styles.subtitle}>Create your account</Text>

          {/* Signup Form Fields */}
          {currentStep === fields.length - 1 ? (
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, { fontFamily: 'San Francisco' }]}
                placeholder={fields[currentStep].placeholder}
                placeholderTextColor="#999"
                value={fields[currentStep].value}
                onChangeText={fields[currentStep].setValue}
                secureTextEntry={fields[currentStep].secureTextEntry}
                keyboardType={fields[currentStep].keyboardType as KeyboardTypeOptions || 'default'}
                autoCapitalize={fields[currentStep].autoCapitalize as 'none' | 'sentences' | 'words' | 'characters' || 'sentences'}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TextInput
              style={[styles.input, { fontFamily: 'San Francisco' }]}
              placeholder={fields[currentStep].placeholder}
              placeholderTextColor="#999"
              value={fields[currentStep].value}
              onChangeText={fields[currentStep].setValue}
              maxLength={fields[currentStep].maxLength}
              keyboardType={fields[currentStep].keyboardType as KeyboardTypeOptions || 'default'}
              autoCapitalize={fields[currentStep].autoCapitalize as 'none' | 'sentences' | 'words' | 'characters' || 'sentences'}
            />
          )}

          {/* Error Message Display */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Navigation Buttons */}
          <View style={[
            styles.buttonContainer,
            loading && { justifyContent: 'center' },
            !loading && currentStep === 0 && { justifyContent: 'center' }
          ]}>
            {!loading && currentStep > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
              >
                <Text style={[styles.buttonText, { fontFamily: 'San Francisco' }]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            
            {!loading ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  currentStep === 0 && { width: '80%' }
                ]}
                onPress={handleNext}
              >
                <Text style={[styles.buttonText, { fontFamily: 'San Francisco' }]}>
                  {currentStep === fields.length - 1 ? 'Register' : 'Next'}
                </Text>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="large" color="#FFFFFF" />
            )}
          </View>

          <Text style={styles.subtitle}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => router.replace('/login')}>
              Log In
            </Text>
          </Text>

          <View style={styles.bottomContainer}>
            <Text style={[styles.subtitle, { fontFamily: 'San Francisco', textAlign: 'center' }]}>
              By continuing, you agree to
              <Text style={{ color: '#306ee9' }} onPress={() => Linking.openURL('https://yourwebsite.com/terms')}> Terms of Service </Text>
              and
              <Text style={{ color: '#306ee9' }} onPress={() => Linking.openURL('https://yourwebsite.com/privacy')}> Privacy Policy.{'\n'}</Text>
            </Text>
            <Text style={{ fontFamily: 'San Francisco', textAlign: 'center' }}>SEBI Reg. Research Analyst</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    width: '100%',
    paddingTop: 95,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 340,
    alignItems: 'center',
    backgroundColor: '#ecf1f2',
  },
  logo: {
    width: 50,
    height: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1b1d1e',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ecf1f2',
    borderColor: '#ecf1f2',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 30,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  button: {
    width: '48%',
    height: 50,
    backgroundColor: '#306ee8',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  backButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 14,
    color: '#FF4444',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'San Francisco',
  },
});

export default SignupScreen;