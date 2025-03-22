// app/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StatusBar, useColorScheme } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { StockProvider } from '@/context/StockContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

   const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const checkLoginStatus = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const loggedIn = !!accessToken;
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StockProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="signup/index" options={{ headerShown: false }} /> {/* Match signup/index */}
            <Stack.Screen name="login/index" options={{ headerShown: false }} />  {/* Add login/index */}
          </Stack>
          {/* Redirect based on login status */}
          {!isLoggedIn && <Redirect href="/signup" />}
          {isLoggedIn && <Redirect href="/(tabs)/home" />}
        </StockProvider>
      </AuthProvider>
      <StatusBar backgroundColor={isDark?'#121212' : '#f7f7f7'}/>
    </SafeAreaProvider>
  );
}