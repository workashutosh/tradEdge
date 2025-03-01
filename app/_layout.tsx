import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const accessToken = await AsyncStorage.getItem('access_token');
      setIsLoggedIn(!!accessToken);
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack  screenOptions={{
              headerShown: false,
            }}>
        {isLoggedIn ? (
          // Render the main screen if logged in
          <Stack.Screen name="main" options={{ headerShown: false }} />
        ) : (
          // Render the login screen if not logged in
          <Stack.Screen name="signup" options={{ headerShown: false }} />
        )}
        {/* Add or remove other routes as needed */}
        {/* <Stack.Screen name="other" options={{ headerShown: false }} /> */}
      </Stack>
    </AuthProvider>
  );
}