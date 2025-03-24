// app/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View, StatusBar, useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Adjust path as needed
import { StockProvider } from '@/context/StockContext'; // Adjust path as needed
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayoutContent: React.FC = () => {
  const { isInitializing, isLoggedIn } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signup/index" options={{ headerShown: false }} />
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
      </Stack>
      {/* Redirect based on login status */}
      {!isLoggedIn && <Redirect href="/signup" />}
      {isLoggedIn && <Redirect href="/(tabs)/home" />}
      <StatusBar backgroundColor={isDark ? '#121212' : '#f7f7f7'} />
    </>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StockProvider>
          <RootLayoutContent />
        </StockProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}