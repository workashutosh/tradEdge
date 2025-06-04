import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/utils/theme';

interface TransactionItemProps {
  item: any; // Replace with a more specific type if available
}

const TransactionItem: React.FC<TransactionItemProps> = ({ item }) => {
  const colors = useTheme();

  const formattedDate = item.payment_date
    ? new Date(item.payment_date.replace(' ', 'T')).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
      })
    : 'N/A';

  const isCredit = item.amount > 0;
  const avatarInitial = item.packageName ? item.packageName.charAt(0).toUpperCase() : '?';
  const avatarColor = `#${(item.packageName ? item.packageName.length * 123 : 0).toString(16).slice(0, 6).padEnd(6, '0')}`;

  return (
    <ThemedView style={[styles.transactionRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
        <ThemedText style={styles.avatarInitial}>{avatarInitial}</ThemedText>
      </View>

      <View style={styles.transactionDetails}>
        <ThemedText style={[styles.transactionName, { color: colors.text }]}>{item.packageName || 'Unknown Package'}</ThemedText>
        <ThemedText style={[styles.transactionDate, { color: '#fff' }]}>{formattedDate}</ThemedText>
      </View>

      <ThemedText style={[styles.transactionAmount, { color: isCredit ? colors.vgreen : colors.text }]}>
        {isCredit ? `+ ₹${Number(item.amount).toLocaleString('en-IN')}` : `₹${Number(item.amount).toLocaleString('en-IN')}`}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default TransactionItem;