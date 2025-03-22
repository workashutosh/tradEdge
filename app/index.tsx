import { useAuth } from '@/context/AuthContext';

const StartPage = () => {
  const { isLoggedIn } = useAuth();

  // Remove redundant redirect logic
  return null;
};

export default StartPage;