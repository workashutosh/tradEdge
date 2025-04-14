import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Router } from 'expo-router';

// Define types
interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  loading: boolean;
  errorMessage: string;
  isInitializing: boolean;
  userDetails: UserDetailsResponse['data'] | null;
}

interface AuthContextType extends AuthState {
  handleLogin: (loginData: LoginResponse['data'], router: Router) => Promise<boolean>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  success: boolean;
  statusCode: number;
  messages: string[];
  data: {
    user_id: string;
    user_name: string;
    user_role: string;
    session_id: string;
    access_token: string;
    access_token_expiry: number;
    refresh_token: string;
    refresh_token_expiry: number;
  };
}

interface UserDetailsResponse {
  status: string; // Changed from success to status
  message?: string;
  data: {
    user_id: string;
    username: string; // Changed from user_name to username
    session_id?: string;
    user_full_name?: string;
    user_whatsapp_number?: string;
    user_email_id?: string;
    auth?: string;
    aadhar_name?: string;
    pan_name?: string;
    kyc_id?: string;
    submit_date?: string | null;
    user_active?: string;
    user_pass?: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetailsResponse['data'] | null>(null);
  const [userDetailsError, setUserDetailsError] = useState('');
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const getUserDetails = async (userId: string | null) => {
    if (!userId) {
      // console.log('No userId provided for getUserDetails');
      return;
    }

    setUserDetailsLoading(true);
    setUserDetailsError('');

    try {
      // console.log('Fetching user details for userId:', userId);
      const response = await axios.get<UserDetailsResponse>(
        `https://gateway.twmresearchalert.com/kyc?user_id=${userId}`
      );

      // console.log('API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') { // Changed from response.data.success
        setUserDetails(response.data.data);
        await AsyncStorage.setItem('user_details', JSON.stringify(response.data.data));
        // console.log('User details stored successfully:', response.data.data);
      } else {
        setUserDetailsError(response.data.message || 'Failed to fetch user details');
        // console.log('API returned status: failure:', response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      setUserDetailsError(
        (axiosError.response?.data as UserDetailsResponse)?.message || 'An error occurred while fetching user details'
      );
      // console.error('Error fetching user details:', axiosError.message);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        // console.log('Access token found:', !!accessToken);
        if (accessToken) {
          const userId = await AsyncStorage.getItem('user_id');
          // console.log('User ID found:', userId);
          if (userId) {
            await getUserDetails(userId);
            setIsLoggedIn(true);
          } else {
            // console.log('No user_id found in AsyncStorage');
          }
        } else {
          // console.log('No access_token found, user not logged in');
        }
      } catch (error) {
        // console.error('Error checking login status:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async (loginData: LoginResponse['data'], router: Router): Promise<boolean> => {
    setLoading(true);
    setErrorMessage('');

    try {
      const userId = loginData.user_id.replace('LNUSR', '');
      // console.log('User ID:', userId);

      await AsyncStorage.setItem('access_token', loginData.access_token);
      await AsyncStorage.setItem('user_id', userId);

      await getUserDetails(userId);

      setIsLoggedIn(true);
      router.replace('/(tabs)/home');
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<UserDetailsResponse>;
      const errorMsg =
        'messages' in (axiosError.response?.data || {})
          ? ((axiosError.response?.data as unknown) as LoginResponse).messages.join(', ')
          : 'Error processing login';

      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['user_details', 'access_token', 'user_id']);
      setUserDetails(null);
      setIsLoggedIn(false);
      // console.log('Logged out successfully');
    } catch (error) {
      // console.error('Error during logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    setIsLoggedIn,
    userDetails,
    loading,
    errorMessage,
    isInitializing,
    handleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};