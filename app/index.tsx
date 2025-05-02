import { Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';

const StartPage = () => {
  const { isLoggedIn, isInitializing } = useUser();

  if (isInitializing) {
    return null; // Let RootLayout handle the loading state
  }

  // Redirect to the appropriate screen based on login status
  return isLoggedIn ? <Redirect href="/(tabs)/home" /> : <Redirect href="/otp" />;
  // return <Redirect href="/main/Ticker" />;
};

export default StartPage;