import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    // Background: Softer dark for less eye strain, lighter off-white for warmth
    background: isDark ? '#181818' : '#f8f9fc',
    
    // Header Background: Slightly lighter dark for depth, clean white for light mode
    headerBackground: isDark ? '#252525' : '#ffffff',
    
    // Header Border: Subtle contrast for separation
    headerBorderBottom: isDark ? '#383838' : '#e8ecef',
    
    // Text: High contrast for readability (WCAG-compliant)
    text: isDark ? '#e0e0e0' : '#1a1a1a',
    
    // Button Background: Neutral tones for versatility
    buttonBackground: isDark ? '#e0e0e0' : '#2c2c2c',
    
    // Button Primary: Vibrant green, slightly toned for accessibility
    buttonPrimary: '#2e8b57', // Sea green, good contrast on white/black
    
    // Button Text: High contrast against button background
    buttonText: isDark ? '#1a1a1a' : '#ffffff',
    
    // Card: Subtle differentiation from background
    card: isDark ? 'rgb(8, 8, 8)' : '#fefefe',
    
    // Border: Softer for less harshness
    border: isDark ? '#444444' : '#d1d5db',
    
    // Shadow: Adjusted opacity for subtlety
    shadowColor: isDark ? 'rgb(153, 153, 153)' : 'rgb(0, 0, 0)',
    
    // Error: Softer red for less aggression, still clear
    error: '#e63946',
    
    // Primary: Richer purple for vibrancy
    primary: '#7b2cbf',
    
    // Secondary: Teal, adjusted for better dark mode contrast
    secondary: isDark ? '#26a69a' : '#26a69a',
    
    // Success: Brighter green for positivity
    success: '#2ecc71',
    
    // Warning: Warmer amber for clarity
    warning: '#f4a261',
    
    // Tag Text: High contrast for readability
    tagText: isDark ? '#e0e0e0' : '#2c2c2c',
    
    // Selected Tag Text: Ensure contrast against selected background
    selectedTagText: isDark ? '#1a1a1a' : '#ffffff',
    
    // Tag Background: Neutral, low contrast
    tagBackground: isDark ? '#444444' : '#e5e7eb',
    
    // Selected Tag Background: Clear differentiation
    selectedTagBackground: isDark ? '#e0e0e0' : '#1f2937',

    vgreen: '#2E7D32'
  };
};