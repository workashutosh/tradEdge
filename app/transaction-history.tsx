import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '@/utils/theme';
import TransactionHistory from '../components/TransactionHistory';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TransactionHistoryPage() {
  const { userTransactions } = useUser();
  const colors = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  // Flatten all payments into a single array with parent package info
  const allPayments = userTransactions
    .flatMap((item: any) =>
      (item.payment_history || []).map((payment: any) => ({
        ...payment,
        packageName: item.package_details?.subtype_name,
        packagePrice: item.package_details?.package_price,
        purchaseDate: item.purchase_info?.purchase_date,
      }))
    )
    .sort((a, b) => {
      const dateA = a.payment_date ? new Date(a.payment_date.replace(' ', 'T')).getTime() : 0;
      const dateB = b.payment_date ? new Date(b.payment_date.replace(' ', 'T')).getTime() : 0;
      return dateB - dateA; // Descending order (latest first)
    });

  // Group transactions by month and year
  const groupedPayments = allPayments.reduce((acc: any, payment: any) => {
    const date = payment.payment_date ? new Date(payment.payment_date.replace(' ', 'T')) : null;
    if (!date) return acc;
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const yearMonth = `${year} ${month}`;

    if (!acc[yearMonth]) {
      acc[yearMonth] = [];
    }
    acc[yearMonth].push(payment);
    return acc;
  }, {});

  // Convert the grouped object into an array of objects for SectionList
  const sections = Object.keys(groupedPayments).map(yearMonth => ({
    title: yearMonth,
    data: groupedPayments[yearMonth],
  }));

  // Function to toggle the expanded state of a section
  const toggleSection = (sectionTitle: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prevState => ({
      ...prevState,
      [sectionTitle]: !prevState[sectionTitle],
    }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Transaction History',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <TransactionHistory
        sections={sections}
        expandedSections={expandedSections}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSection={toggleSection}
      />
    </ThemedView>
  );
} 