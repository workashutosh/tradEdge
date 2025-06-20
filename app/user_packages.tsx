// app/packages.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/utils/theme';
import { useUser } from '@/context/UserContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { router } from 'expo-router';
import moment from 'moment'; // ✅ Add for date formatting

const PackagesScreen = () => {
  const colors = useTheme();
  const router = useRouter();
  const { userTransactions } = useUser();
  const [expanded, setExpanded] = useState(true);

  console.log('🧾 userTransactions:', JSON.stringify(userTransactions, null, 2));

  const getPackageTransactions = () => {
    if (!userTransactions || userTransactions.length === 0) {
      return [];
    }

    return userTransactions
      .filter(
        (txn: any) =>
          txn.package_details?.subtype_name &&
          txn.package_details?.subtype_id &&
          Array.isArray(txn.payment_history)
      )
      .flatMap((item: any) =>
        item.payment_history.map((payment: any) => {
          const packageId = String(item.package_details.subtype_id);
          return {
            ...payment,
            package_id: packageId,
            packageName: item.package_details.subtype_name,
            packagePrice: item.package_details.package_price ?? '0',
            purchaseDate: item.purchase_info?.purchase_date ?? '',
            expiryDate: item.purchase_info?.expiry_date ?? '',
            type: 'package',
          };
        })
      );
  };

  const packageTransactions = getPackageTransactions();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      backgroundColor: colors.background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: colors.card,
      shadowColor: colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      marginBottom: 16,
    },
    headerText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderColor: colors.border,
      borderWidth: 1,
      shadowColor: colors.primary,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 6,
      color: colors.primary,
    },
    cardText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 2,
    },
    emptyText: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
    },
  });

  const formatDate = (dateString: string) => {
    return dateString ? moment(dateString).format('DD MMM YYYY') : 'N/A';
  };

  return (
    <ThemedView style={styles.container}>
      <MaterialIcons
        name="arrow-back"
        size={28}
        color={colors.primary}
        style={{ marginRight: 8 }}
        onPress={() => router.replace('/profile')}
      />
      <TouchableOpacity
        style={styles.headerContainer}
        onPress={() => setExpanded(!expanded)}
      >
        <ThemedText style={styles.headerText}>Browse Purchased Packages</ThemedText>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={26}
          color={colors.text}
        />
      </TouchableOpacity>

      {expanded ? (
        packageTransactions.length > 0 ? (
          <FlatList
            data={packageTransactions}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (!item.package_id) {
                    console.warn('❌ Invalid package_id');
                    return;
                  }

                  router.push({
                    pathname: '/main/TradeDetails',
                    params: {
                      package_id: item.package_id,
                      package_name: item.packageName,
                      package_price: item.packagePrice,
                      payment_date: item.payment_date,
                    },
                  });
                }}
                activeOpacity={0.7}
                style={[styles.card, { shadowColor: colors.shadowColor }]}
              >
                <View>
                  <ThemedText style={styles.cardTitle}>{item.packageName}</ThemedText>
                  <ThemedText style={styles.cardText}>Price: ₹{item.packagePrice}</ThemedText>
                  <ThemedText style={styles.cardText}>Paid on: {formatDate(item.purchaseDate)}</ThemedText>
                  <ThemedText style={styles.cardText}>Valid till: {formatDate(item.expiryDate)}</ThemedText>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <ThemedText style={styles.emptyText}>No purchased packages found.</ThemedText>
        )
      ) : null}
    </ThemedView>
  );
};

export default PackagesScreen;
