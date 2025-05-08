import React from 'react';
import { Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useFonts } from 'expo-font';
import { Text as DefaultText, TextProps, View } from 'react-native';

// Custom Text Component to Apply Kanchenjunga Font Globally
const Text: React.FC<TextProps> = ({ style, ...props }) => {
  return <DefaultText style={[{ fontFamily: 'Kanchenjunga' }, style]} {...props} />;
};

const StartPage = () => {
  const { isLoggedIn, isInitializing } = useUser();

  // Load the Kanchenjunga font
  const [fontsLoaded] = useFonts({
    'Kanchenjunga-Regular': require('../assets/fonts/Kanchenjunga-Regular.ttf'),
    'Kanchenjunga-SemiBold': require('../assets/fonts/Kanchenjunga-SemiBold.ttf'),
    'Kanchenjunga-Bold': require('../assets/fonts/Kanchenjunga-Bold.ttf'),
  });


  if (isInitializing && !fontsLoaded) {
    return null; // Let RootLayout handle the loading state
  }

  // Redirect to the appropriate screen based on login status
  return isLoggedIn ? <Redirect href="/(tabs)/home" /> : <Redirect href="/otp" />;
};

export default StartPage;