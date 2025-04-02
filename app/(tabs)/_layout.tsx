import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, User, TrendingUp, Newspaper, Crown } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useAuth();

  // Redirect to signup if not logged in
  if (!isLoggedIn) {
    // return <Redirect href="/signup" />;
    return <Redirect href="/otp" />;
  }


  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const styles = StyleSheet.create({
    tabBarStyle: {
      backgroundColor,
      ...Platform.select({
        ios: {
          // position: 'absolute',
          // bottom: 25,
          left: 20,
          right: 20,
          elevation: 0,
          height: 90,
        },
        default: {
          height: 60,
          paddingBottom: 2,
          paddingTop: 5,
          elevation: 8, // Shadow for Android
        },
      }),
    },
    tabBarLabelStyle: {
      fontWeight: '500',
      fontSize: 12,
      marginTop: 3,
    },
    tabBarIconStyle: {
      marginBottom: -2,
      fontWeight: '500',
    },
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarIconStyle: styles.tabBarIconStyle,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="stocks"
        options={{
          title: 'Stocks',
          tabBarIcon: ({ color }) => (
            <TrendingUp size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          title: 'Trades',
          tabBarLabelStyle: {
            fontWeight: '500',
            fontSize: 12,
            marginTop: 3,
            color: '#ffab00' 
          },
          tabBarIcon: ({ color }) => (
            <Crown size={24} fill="#ffab00" color="#ffab00" strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'IPO',
          tabBarIcon: ({ color }) => (
            <Compass size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => (
            <Newspaper size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}