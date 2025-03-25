import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const StartPage = () => {
  const { isLoggedIn, isInitializing } = useAuth();

  if (isInitializing) {
    return null; // Let RootLayout handle the loading state
  }

  // Redirect to the appropriate screen based on login status
  return isLoggedIn ? <Redirect href="/(tabs)/home" /> : <Redirect href="/login" />;
};

export default StartPage;