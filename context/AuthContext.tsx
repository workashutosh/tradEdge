import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Router } from 'expo-router';

// Define types
interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  token: string | null;
  userId: string | null;
  userName: string | null;
  sessionId: string | null;
  loading: boolean;
  errorMessage: string;
  isInitializing: boolean;
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
  success: boolean;
  data: {
    user_id: string;
    user_name: string;
    session_id: string;
    user_full_name?: string;
    user_whatsapp_number?: string;
    user_email_id?: string;
    // Add other fields as needed
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (accessToken) {
          const [storedUserId, storedUserName, storedSessionId, storedRefreshToken] = await Promise.all([
            AsyncStorage.getItem('user_id'),
            AsyncStorage.getItem('user_name'),
            AsyncStorage.getItem('session_id'),
            AsyncStorage.getItem('refresh_token'),
          ]);

          setToken(accessToken);
          setUserId(storedUserId);
          setUserName(storedUserName);
          setSessionId(storedSessionId);
          setRefreshToken(storedRefreshToken);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async (
    loginData: LoginResponse['data'],
    router: Router
  ): Promise<boolean> => {
    setLoading(true);
    setErrorMessage('');

    try {
      // Step 1: Store initial login data from response.data
      const userId= loginData.user_id.replace('LNUSR','');
      // console.log(userId);
      await Promise.all([
        AsyncStorage.setItem('access_token', loginData.access_token),
        AsyncStorage.setItem('refresh_token', loginData.refresh_token),
        AsyncStorage.setItem('user_id', userId),
        AsyncStorage.setItem('user_name', loginData.user_name),
        AsyncStorage.setItem('user_role', loginData.user_role),
        AsyncStorage.setItem('session_id', loginData.session_id),
      ]);

      // Set initial state
      setToken(loginData.access_token);
      setRefreshToken(loginData.refresh_token);
      setUserId(userId);
      setUserName(loginData.user_name);
      setSessionId(loginData.session_id);


      setIsLoggedIn(true);
      router.replace('/(tabs)/home');
      // console.log('loggedIn');
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<UserDetailsResponse>;
      let errorMsg = 'Error processing login';
      // console.log(error);

      if ('messages' in (axiosError.response?.data || {})) {
        errorMsg = (axiosError.response?.data as LoginResponse).messages.join(', ');
      }

      setErrorMessage(errorMsg);
      // console.log(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'user_id',
        'user_name',
        'user_role',
        'session_id',
      ]);

      setIsLoggedIn(false);
      setToken(null);
      setUserId(null);
      setUserName(null);
      setSessionId(null);
      setRefreshToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    setIsLoggedIn,
    token,
    userId,
    userName,
    sessionId,
    loading,
    errorMessage,
    isInitializing,
    handleLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};