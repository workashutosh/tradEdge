import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
  KeyboardTypeOptions,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = () => {
  const [fullName, setFullName] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      required: true
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

    // Required field check
    if (field.required && !value) {
      return `Please enter ${field.placeholder.toLowerCase()}`;
    }

    // Specific validation per field
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
    return null; // No errors
  };

  const handleNext = async () => {
    const errorMessage = validateInput(currentStep);
    if (errorMessage) {
      Alert.alert('Error', errorMessage);
      return;
    }

    if (currentStep === fields.length - 1) {
      setLoading(true);
      const payload = {
        user_full_name: fullName,
        user_whatsapp_number: whatsAppNumber,
        user_alternate_number: whatsAppNumber, // Using WhatsApp number as alternate for now
        user_email_id: email,
        user_position: 1,
        user_active: 'Y',
        password: password,
      };

      try {
        // Step 1: Signup API Request
        const response = await axios.put('http://gateway.twmresearchalert.com/kyc', payload);
        Alert.alert('Success', 'Account created successfully! Logging you in...');
      
        // Step 2: Prepare Login Payload
        const loginPayload = {
          number: whatsAppNumber,
          password: password,
          platform: 'mobile',
        };
      
        try {
          // Step 3: Login API Request
          const loginResponse = await axios.post(
            'https://kyclogin.twmresearchalert.com/session',
            loginPayload
          );
      
          const loginData = loginResponse.data.data;
          // console.log('Login Successful:', loginData);
      
          // Step 4: Store Tokens in AsyncStorage
          await AsyncStorage.setItem('access_token', loginData.access_token);
          await AsyncStorage.setItem('refresh_token', loginData.refresh_token);
          await AsyncStorage.setItem('user_id', loginData.user_id);
          await AsyncStorage.setItem('user_name', loginData.user_name);
      
      
          // Step 6: Navigate to home Page
          router.replace('/home');
        } catch (loginError) {
          // console.error('Login Error:', loginError);
          Alert.alert('Login Failed', 'Auto-login failed. Please log in manually.');
          router.replace('/login'); // Redirect to login if auto-login fails
        }
      } catch (error: any) {
        if (
          error?.response?.data?.status === 'error' &&
          (
            error.response.data.message === 'WhatsApp number already exists' ||
            error.response.data.message === 'WhatsApp number already exists and Email already exists'
          )
        ) {
          Alert.alert('Signup Failed', 'WhatsApp number already exists! Try logging in.');
          router.replace('/login');
        } else if (
          error?.response?.data?.status === 'error' &&
          error.response.data.message === 'Email already exists'
        ) {
          Alert.alert('Signup Failed', 'Email already exists!');
          setCurrentStep(2);
        } else if (
          error?.response?.data?.status === 'error' &&
          error.response.data.message === 'Email already exists'
        ) {
          Alert.alert('Signup Failed', 'Email already exists!');
          setCurrentStep(2);
        } else {
          // console.error('Signup Error:', error);
          Alert.alert('Signup Failed', 'An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }      

    } else {
      setCurrentStep(currentStep + 1);
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
            
            {/* Updated Title */}
            <Text style={[styles.title, { fontFamily: 'San Francisco' }]}>
              Join Now to Get <Text style={{ color: '#306ee9' }}>3 Free Trades</Text>
            </Text>
            
            {/* Moved "Equity | Futures | Options | Commodities" */}
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
        
            {loading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={[styles.buttonText, { fontFamily: 'San Francisco' }]}>
                {currentStep === fields.length - 1 ? 'Register' : 'Next'}
              </Text>
              </TouchableOpacity>
            )}
        
            <Text style={styles.subtitle}>
              Already have an account?{' '}
              <Text style={styles.link} onPress={() => router.replace('/login')}>
              Log In
              </Text>
            </Text>
        
            {/* Moved Terms & Privacy Policy to the Bottom */}
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
    width: "100%",
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
    elevation: 5,
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
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#306ee8',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 20,
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
});

export default SignupScreen;