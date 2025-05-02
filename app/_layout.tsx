import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View, StatusBar, useColorScheme } from 'react-native';
import { AuthProvider, useUser } from '../context/UserContext';
import { StockProvider } from '@/context/StockContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayoutContent: React.FC = () => {
  const { isInitializing } = useUser();
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
        <Stack.Screen name="otp/index" options={{ headerShown: false }} />
      </Stack>
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