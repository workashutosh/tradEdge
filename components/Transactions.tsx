import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/utils/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const Transactions = () => {
  const colors = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderColor: colors.border,
      marginBottom: 10,
    },
    filterButtonText: {
      marginRight: 4,
      fontSize: 14,
    },
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Transaction History Button */}
      <TouchableOpacity 
        style={[styles.filterButton, { borderColor: colors.border }]}
        onPress={() => router.push('/transaction-history')}
      >
        <ThemedText style={[styles.filterButtonText, { color: colors.text }]}>Transaction History</ThemedText>
        <MaterialIcons 
          name="chevron-right" 
          size={20} 
          color={colors.text} 
        />
      </TouchableOpacity>
    </ThemedView>
  );
};

export default Transactions;