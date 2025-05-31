import { useColorScheme } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  border: string;
  primary: string;
  success: string;
  error: string;
  tagBackground: string;
  warning: string;
  selectedTagBackground: string;
  selectedTagText: string;
  tagText: string;
  shadowColor: string;
  vgreen: string;
};

// Define the return type for the useTheme hook
export type ThemeHookReturn = {
  isDarkMode: boolean;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  primary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  error: string;
  shadowColor: string;
  vgreen: string;
  tagBackground: string;
  selectedTagBackground: string;
  selectedTagText: string;
  tagText: string;
};

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#000000',
  border: '#E0E0E0',
  primary: '#04810E',
  success: '#4CAF50',
  error: '#FF5252',
  tagBackground: '#F0F0F0',
  warning: '#FFA726',
  selectedTagBackground: '#04810E',
  selectedTagText: '#FFFFFF',
  tagText: '#000000',
  shadowColor: '#000000',
  vgreen: '#4CAF50',
};

const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  border: '#2C2C2C',
  primary: '#039D74',
  success: '#66BB6A',
  error: '#FF5252',
  tagBackground: '#2C2C2C',
  warning: '#FFB74D',
  selectedTagBackground: '#039D74',
  selectedTagText: '#FFFFFF',
  tagText: '#FFFFFF',
  shadowColor: '#FFFFFF',
  vgreen: '#388E3C',
};

// Update the useTheme hook to return ThemeHookReturn type
export const useTheme = (): ThemeHookReturn => {
  const { settings, isDarkMode } = useSettings();
  const systemTheme = useColorScheme();
  
  // During initial load, use system theme and the determined isDarkMode state
  if (!settings || Object.keys(settings).length === 0) {
    const themeColors = systemTheme === 'dark' ? darkColors : lightColors;
    return { ...themeColors, isDarkMode: systemTheme === 'dark' };
  }

  // Use the isDarkMode value from context and the corresponding colors
  const themeColors = isDarkMode ? darkColors : lightColors;
  return { ...themeColors, isDarkMode };
};