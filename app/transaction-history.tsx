import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from '@/utils/theme';
import TransactionHistory from '../components/TransactionHistory';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '../components/ThemedText';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TransactionHistoryPage() {
  const { userTransactions } = useUser();
  const colors = useTheme();
  const router = useRouter();
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

  
  const getPackageTransactions = () => {
  return userTransactions
    .filter((txn: any) => txn.package_details?.subtype_name) // Ensure it's a package transaction
    .flatMap((item: any) =>
      (item.payment_history || []).map((payment: any) => ({
        ...payment,
        packageName: item.package_details?.subtype_name,
        packagePrice: item.package_details?.package_price,
        purchaseDate: item.purchase_info?.purchase_date,
        type: 'package',
      }))
    );
};


  const styles = StyleSheet.create({
    container: {
      flex: 2,
      backgroundColor: colors.background,
    },
  });

  return (
    <ThemedView style={[styles.container, { paddingTop: 18 }]}>
      <Stack.Screen
        options={{
          title: 'Transaction History',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <MaterialIcons name="arrow-back" size={28} color={colors.primary} style={{ marginRight: 8 }} onPress={() => router.replace('/profile')} />
        <ThemedText type="title" style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', flex: 1 }}>Transaction History</ThemedText>
      </View>
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