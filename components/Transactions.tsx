import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/utils/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const Transactions = () => {
  const colors = useTheme();
  const router = useRouter();

  return (
    <View>
      {/* Transaction History Button */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
        borderRadius: 14,
        padding: 10,
        marginTop: 10,
        shadowColor: colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
        }}
        onPress={() => router.push('/transaction-history')}
      >
        <ThemedText
          style={{
            marginRight: 4,
            fontSize: 14,
            color: colors.text,
          }}
        >
          Transaction History
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

export default Transactions;
