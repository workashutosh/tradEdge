import React, { useState } from 'react';
import { FlatList, StyleSheet, View, Dimensions, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useUser } from '../context/UserContext';
import { useTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Transactions = () => {
  const { userTransactions } = useUser();
  const colors = useTheme();

  // Calculate 80% of the screen height
  const { height: screenHeight } = Dimensions.get('window');
  const transactionsHeight = screenHeight * 0.8;

  // Collapsible state for the whole table
  const [expanded, setExpanded] = useState(false);

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

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const renderHeader = () => (
    <TouchableOpacity
      style={[styles.tableHeader, { backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      <ThemedText style={[styles.headerCell, { color: colors.text }]}>Transactions</ThemedText>
      <Ionicons
        name={expanded ? 'chevron-down' : 'chevron-forward'}
        size={22}
        color={colors.text}
      />
    </TouchableOpacity>
  );

  const renderRow = ({ item }: { item: any }) => {
    const paymentStatus = item.payment_status || 'N/A';
    const formattedDate = item.payment_date
      ? new Date(item.payment_date.replace(' ', 'T')).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

    // Status color logic
    let statusColor = '#FF3333'; // default: failed
    if (paymentStatus.toLowerCase() === 'completed') statusColor = '#00cc00';
    else if (paymentStatus.toLowerCase() === 'pending') statusColor = '#FFA500';

    return (
      <ThemedView style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: statusColor }]}>
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: colors.card }}>
          <ThemedText style={[styles.packageName, { color: colors.text }]}>{item.packageName}</ThemedText>
          <ThemedText style={[styles.transactionAmount, { color: statusColor }]}>
            ₹{Number(item.amount).toLocaleString('en-IN')}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card }}>
          <ThemedText style={[styles.transactionTime, { color: colors.text }]}>
            {formattedDate}
          </ThemedText>
          <ThemedText
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor, color: '#fff' },
            ]}
          >
            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <View
      style={{
        height: expanded ? transactionsHeight : 56,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.background,
      }}
    >
      <ThemedView style={[styles.container, { backgroundColor: colors.background, paddingBottom: 0 }]}>
        {renderHeader()}
        {expanded && (
          <FlatList
            data={allPayments}
            keyExtractor={(item) => item.payment_id?.toString() || Math.random().toString()}
            renderItem={renderRow}
            contentContainerStyle={styles.tableBody}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          />
        )}
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  tableHeader: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  headerCell: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  transactionCard: {
    flexDirection: 'column',
    padding: 18,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    flex: 1,
    flexWrap: 'wrap',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  transactionTime: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 10,
    textAlign: 'center',
    minWidth: 70,
  },
  tableBody: {
    paddingBottom: 20,
  },
});

export default Transactions;