import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

const StartPage = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/signup" />;
  } else {
    return <Redirect href="/(tabs)/home" />; // Redirect to the home tab
  }
};

export default StartPage;