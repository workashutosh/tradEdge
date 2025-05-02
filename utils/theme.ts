import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    background: isDark ? '#121212' : '#f5f7fa',
    headerBackground: isDark ? '#1e1e1e' : '#ffffff',
    headerBorderBottom: isDark ? '#2d2d2d' : '#eef1f5',
    text: isDark ? '#ffffff' : '#333333',
    buttonBackground: isDark ? '#ffffff' : '#000000',
    buttonPrimary: 'rgb(44, 145, 5)',
    buttonText: isDark ? '#000000' : '#ffffff',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    shadowColor: isDark ? 'rgb(128, 128, 128)' : 'rgb(0, 0, 0)',
    error: '#ff4444',
    primary: '#6200ee',
    secondary: isDark ? '#03dac6' : '#03dac6',
    success: '#00c853',
    warning: '#ffab00',
    tagText: isDark? 'white':'black',
    selectedTagText: isDark? 'black':'white',
    tagBackground: isDark ? '#333333' : '#e0e0e0',
    selectedTagBackground: isDark? 'white':'black',
  };
};