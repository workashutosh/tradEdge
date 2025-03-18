import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

const StartPage = () => {
  const { isLoggedIn } = useAuth();

  // Remove redundant redirect logic
  return null;
};

export default StartPage;