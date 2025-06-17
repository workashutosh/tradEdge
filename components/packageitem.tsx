// PackageItem.tsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@/utils/theme';

const PackageItem = ({ item }: { item: any }) => {
  const colors = useTheme();

  const handleBuy = () => {
    // Trigger API call or navigation
    alert(`Buying package: ${item.subtype_name}`);
  };

  return (
    <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
      <ThemedText style={[styles.title, { color: colors.text }]}>{item.subtype_name}</ThemedText>
      <ThemedText style={{ color: colors.text }}>₹{item.package_price}</ThemedText>
      <TouchableOpacity onPress={handleBuy} style={[styles.button, { backgroundColor: colors.primary }]}>
        <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Buy Now</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default PackageItem;
