import React from 'react';
import { FlatList, StyleSheet, useColorScheme } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useUser } from '../context/UserContext';

const Transactions = () => {
  const { userTransactions } = useUser();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    amount: '#00cc00', // Green for amount, matching the image
    cardBackground: isDark ? '#1e1e1e' : '#ffffff',
  };

  const renderHeader = () => (
    <ThemedView style={[styles.tableHeader, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.headerCell, { color: colors.text }]}>Transactions</ThemedText>
    </ThemedView>
  );

  interface Transaction {
    type: string;
    amount: number;
    transactionId: string;
    timestamp: string;
  }
  
  const renderRow = ({ item }: { item: any }) => {
    // const { type, amount, transactionId, timestamp } = item;

    return (
      <ThemedView style={[styles.transactionCard, { backgroundColor: colors.cardBackground }]}>
        <ThemedView style={[{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <ThemedText style={[styles.packageName, { color: colors.text }]}>{item.package_details.subtype_name}</ThemedText>
          <ThemedText style={[styles.transactionAmount, { color: colors.amount }]}>{`₹${Number(item.package_details.package_price).toLocaleString('en-IN')}`}</ThemedText>
        </ThemedView>
        {/* <ThemedText style={[styles.packageName, { color: colors.text }]}>{item.package_details.subtype_name}</ThemedText>
        <ThemedText style={[styles.transactionAmount, { color: colors.amount }]}>{item.package_details.package_price}</ThemedText> */}
        {/* <ThemedText style={[styles.transactionId, { color: colors.text }]}>{`Lee`}</ThemedText> */}
        <ThemedText style={[styles.transactionTime, { color: colors.text }]}>{`${item.purchase_info.purchase_date}`}</ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <FlatList
        data={userTransactions}
        keyExtractor={(item) => item.transactionId}
        renderItem={renderRow}
        contentContainerStyle={styles.tableBody}
        nestedScrollEnabled={true} // Enable nested scrolling
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  tableHeader: {
    paddingVertical: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
  },
  headerCell: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionCard: {
    flexDirection: 'column',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2, // Shadow for card effect
  },
  packageName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 5,
  },
  transactionId: {
    fontSize: 14,
    marginBottom: 5,
  },
  transactionTime: {
    fontSize: 14,
    color: '#666',
  },
  tableBody: {
    paddingBottom: 20,
  },
});

export default Transactions;