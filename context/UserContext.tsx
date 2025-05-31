import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Router } from 'expo-router';
import { useStockContext } from './StockContext';


interface UserContextType {
  isLoggedIn: boolean;
  userDetails: UserDetailsResponse['data'] | null;
  userDetailsLoading: boolean;
  userDetailsError: string;
  loginLoading: boolean;
  errorMessage: string;
  isInitializing: boolean;
  userTransactions: any[]; // Expose transactions in the context
  transactionsLoading: boolean;
  transactionsError: string;
  purchasedPackagesId: string[]; // Expose purchasedPackagesId
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  handleLogin: (loginData: LoginResponse['data'], router: Router) => Promise<boolean>;
  logout: () => Promise<void>;
  getUserTransactions: (userId: string | null) => Promise<void>; // Add getUserTransactions to the context
}

interface UserProviderProps {
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

const UseContext = createContext<UserContextType | undefined>(undefined);

export const AuthProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetailsResponse['data'] | null>(null);
  const [userDetailsError, setUserDetailsError] = useState('');
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [transactionsError, setTransactionsError] = useState('');
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [purchasedPackagesId, setPurchasedPackagesId] = useState<string[]>([]);

  // Check login status on initial load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const [accessToken, userId] = await Promise.all([
          AsyncStorage.getItem('access_token'),
          AsyncStorage.getItem('user_id')
        ]);

        if (accessToken && userId) {
          await Promise.all([
            getUserDetails(userId),
            getUserTransactions(userId)
          ]);
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

  // Optimized get user details
  const getUserDetails = useCallback(async (userId: string | null) => {
    if (!userId) return;

    setUserDetailsLoading(true);
    setUserDetailsError('');

    try {
      const response = await axios.get<UserDetailsResponse>(
        `https://gateway.twmresearchalert.com/kyc?user_id=${userId}`
      );

      if (response.data.status === 'success') {
        setUserDetails(response.data.data);
        await AsyncStorage.setItem('user_details', JSON.stringify(response.data.data));
      } else {
        setUserDetailsError(response.data.message || 'Failed to fetch user details');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      setUserDetailsError(
        (axiosError.response?.data as UserDetailsResponse)?.message || 'An error occurred while fetching user details'
      );
    } finally {
      setUserDetailsLoading(false);
    }
  }, []);

  // Optimized get user transactions
  const getUserTransactions = useCallback(async (userId: string | null) => {
    if (!userId) return;

    setTransactionsLoading(true);
    setTransactionsError('');

    try {
      const response = await axios.get(
        `https://tradedge-server.onrender.com/api/userTransactionsById?user_id=${userId}`
      );

      if (response.data.transactions.status === 'success') {
        const packages = response.data.transactions.data.packages || [];
        setUserTransactions(packages);

        const packageIds = packages
          .filter((pkg: any) =>
            parseFloat(pkg.payment_history?.[0]?.amount) === parseFloat(pkg.package_details.package_price) &&
            pkg.payment_history?.[0]?.payment_status === 'completed'
          )
          .map((pkg: any) => pkg.package_details.subtype_id);
        setPurchasedPackagesId(packageIds);
      } else {
        setTransactionsError(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      setTransactionsError(
        (axiosError.response?.data as { message?: string })?.message || 'An error occurred while fetching transactions'
      );
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // Optimized handle login
  const handleLogin = useCallback(async (loginData: LoginResponse['data'], router: Router): Promise<boolean> => {
    setLoginLoading(true);
    setErrorMessage('');

    try {
      const userId = loginData.user_id.replace('LNUSR', '');
      
      // Store tokens and fetch data in parallel
      await Promise.all([
        AsyncStorage.setItem('access_token', loginData.access_token),
        AsyncStorage.setItem('user_id', userId)
      ]);

      // Fetch user details and transactions in parallel
      await Promise.all([
        getUserDetails(userId),
        getUserTransactions(userId)
      ]);

      setIsLoggedIn(true);
      router.replace('/(tabs)/home');
      
      // Fetch packages after navigation
      const stockContext = await import('./StockContext').then(module => module.useStockContext());
      if (stockContext) {
        await stockContext.fetchPackages(true);
      }
      
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
      setLoginLoading(false);
    }
  }, [getUserDetails, getUserTransactions]);

  // Optimized logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['user_details', 'access_token', 'user_id']);
      setUserDetails(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
    userDetails,
    userDetailsLoading,
    userDetailsError,
    loginLoading,
    errorMessage,
    isInitializing,
    userTransactions,
    transactionsLoading,
    transactionsError,
    purchasedPackagesId,
    setIsLoggedIn,
    handleLogin,
    logout,
    getUserTransactions,
  }), [
    isLoggedIn,
    userDetails,
    userDetailsLoading,
    userDetailsError,
    loginLoading,
    errorMessage,
    isInitializing,
    userTransactions,
    transactionsLoading,
    transactionsError,
    purchasedPackagesId,
    handleLogin,
    logout,
    getUserTransactions,
  ]);

  return <UseContext.Provider value={value}>{children}</UseContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UseContext);
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};