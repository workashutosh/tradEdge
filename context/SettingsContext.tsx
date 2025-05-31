import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsData } from '@/components/settings/settingsData';
import { useColorScheme } from 'react-native';

type SettingsState = {
  [key: string]: boolean | string;
};

type SettingsContextType = {
  settings: SettingsState;
  updateSetting: (id: string, value: boolean | string) => Promise<void>;
  resetSettings: () => Promise<void>;
  isDarkMode: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>({});
  const systemTheme = useColorScheme();
  
  // Compute isDarkMode based on settings and system theme
  const isDarkMode = settings['dark_mode'] === true || 
    (settings['dark_mode'] === undefined && systemTheme === 'dark');

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('app_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        // Initialize with default values from settingsData
        const defaultSettings: SettingsState = {};
        Object.values(settingsData).forEach(category => {
          category.subOptions.forEach(option => {
            defaultSettings[option.id] = option.value;
          });
        });
        setSettings(defaultSettings);
        await AsyncStorage.setItem('app_settings', JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (id: string, value: boolean | string) => {
    try {
      const newSettings = { ...settings, [id]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      
      // Handle specific settings that need immediate effect
      switch (id) {
        case 'dark_mode':
          // Theme change is handled automatically through the isDarkMode computation
          console.log('Theme updated:', value);
          break;
        case 'notifications':
          // Handle notification permissions
          console.log('Notifications updated:', value);
          break;
        case 'language':
          // Handle language change
          console.log('Language updated:', value);
          break;
        // Add more cases for other settings that need immediate effect
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const resetSettings = async () => {
    try {
      const defaultSettings: SettingsState = {};
      Object.values(settingsData).forEach(category => {
        category.subOptions.forEach(option => {
          defaultSettings[option.id] = option.value;
        });
      });
      setSettings(defaultSettings);
      await AsyncStorage.setItem('app_settings', JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, isDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 