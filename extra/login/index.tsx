import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons'; // Import the icon set
import { Pressable } from 'react-native';
import { ScrollView } from 'react-native';
import { useUser } from '@/context/UserContext';

const LoginScreen = () => {
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const { handleLogin, loading, errorMessage } = useUser();
  const router = useRouter();

  const onLoginPress = async (): Promise<void> => {
    await handleLogin(whatsAppNumber, password, router);
  };

  return (
    <LinearGradient colors={['#306ee8', '#306ee8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <Text style={[styles.title, { fontFamily: 'San Francisco' }]}>
            Welcome to  
            <Text style={{ color: '#306ee9' }}> TradeEdge</Text>
          </Text>
          <Text style={styles.subtitle}>Please login to continue</Text>

          <TextInput
            style={[styles.input, { fontFamily: 'San Francisco' }]}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            value={whatsAppNumber}
            onChangeText={setWhatsAppNumber}
            maxLength={10}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { fontFamily: 'San Francisco' }]}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'} // Toggle icon based on state
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Error Message Display */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={onLoginPress}>
              <Text style={[styles.buttonText, { fontFamily: 'San Francisco' }]}>Log In</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.subtitle}>Don’t have an account? </Text>
          <Pressable onPress={() => router.replace('/signup')}>
            <Text style={styles.link}>Register</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export const styles = StyleSheet.create({
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
    borderRadius: 20,
    padding: 20,
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
    marginBottom: 30,
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
    elevation: 20,
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
  forgotPassword: {
    fontSize: 14,
    color: '#FF6F61',
    textDecorationLine: 'underline',
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
    fontFamily: 'Kanchenjunga',
  },
});

export default LoginScreen;