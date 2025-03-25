// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Router } from 'expo-router';

// Define types
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  userId: string | null;
  userName: string | null;
  loading: boolean;
  errorMessage: string;
  isInitializing: boolean; // Add isInitializing to AuthState
}

interface AuthContextType extends AuthState {
  handleLogin: (whatsAppNumber: string, password: string, router: Router) => Promise<boolean>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  data: {
    access_token: string;
    refresh_token: string;
    user_id: string;
    user_name: string;
    messages?: string[]; // Make messages optional
  };
}

// Create context with default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Check for existing session on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (accessToken) {
          setToken(accessToken);
          setIsLoggedIn(true);
          setUserId(await AsyncStorage.getItem('user_id'));
          setUserName(await AsyncStorage.getItem('user_name'));
          setRefreshToken(await AsyncStorage.getItem('refresh_token'));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsInitializing(false); // Set to false when done
      }
    };
    checkLoginStatus();
  }, []);

  const login = async (accessToken: string): Promise<void> => {
    try {
      await AsyncStorage.setItem('access_token', accessToken);
      setIsLoggedIn(true);
      setToken(accessToken);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const handleLogin = async (
    whatsAppNumber: string,
    password: string,
    router: Router
  ): Promise<boolean> => {
    if (!whatsAppNumber || !password) {
      setErrorMessage('Please fill in all fields');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    setLoading(true);

    try {
      const loginUrl = process.env.EXPO_PUBLIC_LOGIN_URL;
      if (!loginUrl) {
        setErrorMessage('Login URL is not defined');
        return false;
      }

      const response = await axios.post<LoginResponse>(loginUrl, {
        number: whatsAppNumber,
        password: password,
        platform: 'mobile',
      });

      const userId = response.data.data.user_id.replace('LNUSR', '');

      await Promise.all([
        login(response.data.data.access_token),
        AsyncStorage.setItem('refresh_token', response.data.data.refresh_token),
        AsyncStorage.setItem('user_id', userId),
        AsyncStorage.setItem('user_name', response.data.data.user_name),
      ]);

      setUserId(userId);
      setUserName(response.data.data.user_name);
      
      // console.log("redirecting to home");
      router.replace('/(tabs)/home');
      // console.log(AsyncStorage.getAllKeys());
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<LoginResponse>;
      if (axiosError.response?.data?.data?.messages?.[0] === "Too Many Incorrect Password Attempts") {
        setErrorMessage('Too Many Incorrect Password Attempts! Try after 30 minutes');
      } else {
        setErrorMessage('Invalid Credentials');
      }
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
        'user_name'
      ]);
      setIsLoggedIn(false);
      setToken(null);
      setUserId(null);
      setUserName(null);
      setRefreshToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    token,
    userId,
    userName,
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