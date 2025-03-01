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
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

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
    { placeholder: 'Full Name', value: fullName, setValue: setFullName, required: true },
    {
      placeholder: 'WhatsApp Number',
      value: whatsAppNumber,
      setValue: setWhatsAppNumber,
      keyboardType: 'phone-pad',
      maxLength: 10,
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

  const validateInput = (step) => {
    const field = fields[step];
    const value = field.value.trim();

    // Required field check
    if (field.required && !value) {
      return `Please enter ${field.placeholder.toLowerCase()}`;
    }

    // Specific validation per field
    switch (step) {
      case 0: // Full Name
        if (value.length < 2) {
          return 'Full name must be at least 2 characters long';
        }
        break;

      case 1: // WhatsApp Number
        if (!/^\d{10}$/.test(value)) {
          return 'WhatsApp number must be a 10-digit number';
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
        if (!/[!@#$%^&*]/.test(value)) {
          return 'Password must contain at least one special character (e.g., !@#$%^&*)';
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
      try {
        const payload = {
          user_full_name: fullName,
          user_whatsapp_number: whatsAppNumber.startsWith('+91') ? whatsAppNumber : `+91${whatsAppNumber}`,
          user_alternate_number: whatsAppNumber.startsWith('+91') ? whatsAppNumber : `+91${whatsAppNumber}`, // Using WhatsApp number as alternate for now
          user_email_id: email,
          user_position: 1,
          user_active: 'Y',
          password: password,
        };

        await axios.put('http://gateway.twmresearchalert.com/kyc', payload);

        Alert.alert('Success', 'Account created successfully! Please log in.');
        router.replace('/login');
      } catch (error) {
        Alert.alert('Signup Failed', error.response?.data?.messages?.[0] || 'An error occurred');
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
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <Text style={[styles.title, { fontFamily: 'San Francisco' }]}>
            Join <Text style={{ color: '#306ee9' }}>TradeEdge</Text>
          </Text>
          <Text style={styles.subtitle}>Create your account</Text>

          {/* Render only the current field */}
          {currentStep === fields.length - 1 ? (
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, { fontFamily: 'San Francisco' }]}
                placeholder={fields[currentStep].placeholder}
                placeholderTextColor="#999"
                value={fields[currentStep].value}
                onChangeText={fields[currentStep].setValue}
                secureTextEntry={fields[currentStep].secureTextEntry}
                keyboardType={fields[currentStep].keyboardType || 'default'}
                autoCapitalize={fields[currentStep].autoCapitalize || 'sentences'}
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
              keyboardType={fields[currentStep].keyboardType || 'default'}
              maxLength={fields[currentStep].maxLength}
              autoCapitalize={fields[currentStep].autoCapitalize || 'sentences'}
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
          <Text style={styles.subtitle}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={styles.link}>Log In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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