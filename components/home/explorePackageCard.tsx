// app/(tabs)/home/ExplorePackageCard.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface PackagesItem {
  package_id: string;
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  riskCategory: string;
  minimumInvestment: string;
  profitPotential: string;
}

interface ExplorePackageCardProps {
  item: PackagesItem;
  shimmerAnim: Animated.Value;
  colors: {
    shadowColor: string;
    text: string;
  };
}

export default function ExplorePackageCard({ item, shimmerAnim, colors }: ExplorePackageCardProps) {
  const handleTradePress = () => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        package_id: item.package_id,
        title: item.title,
        price: item.price,
        details: JSON.stringify(item.details),
        categoryTag: item.categoryTag,
        icon: item.icon,
        riskCategory: item.riskCategory,
        minimumInvestment: item.minimumInvestment,
        profitPotential: item.profitPotential,
      },
    });
  };

  return (
    <ThemedView style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}>
      <TouchableOpacity onPress={handleTradePress}>
        <ThemedView style={styles.cardHeader}>
          <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
          <MaterialIcons style={styles.cardIcon} name={item.icon} size={26} color="green" />
        </ThemedView>
        <ThemedView style={styles.cardBody}>
          <ThemedText>{item.details[0]}</ThemedText>
          <View style={{ flexDirection: 'row', gap: 3, paddingTop: 8 }}>
            <Check color="rgb(0, 255, 42)" size={24} />
            <ThemedText>Daily calls</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: 3, paddingBottom: 8 }}>
            <Check color="rgb(0, 255, 42)" size={24} />
            <ThemedText>Profit margin 80%</ThemedText>
          </View>
        </ThemedView>
        <ThemedView style={styles.cardFooter}>
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerAnim }, { rotate: '35deg' }] },
            ]}
          />
          <ThemedView style={{ borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'transparent' }}>
            <ThemedText style={[styles.cardPrice, { textDecorationLine: 'line-through', color: 'white' }]}>
              ₹ {item.price ? new Intl.NumberFormat('en-IN').format(Number(item.price)) : 'N/A'}
            </ThemedText>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.24)', 'rgba(255, 255, 255, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ borderRadius: 10 }}
            >
              <ThemedText style={[styles.cardDiscountedPrice, { marginLeft: 8, color: 'black' }]}>
                ₹ 1,999/-
              </ThemedText>
            </LinearGradient>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 210,
    width: 250,
    borderColor: 'green',
    marginHorizontal: 8,
    borderWidth: 1,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  cardBody: {
    height: '55%',
    justifyContent: 'center',
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  cardFooter: {
    height: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgb(30, 106, 0)',
    overflow: 'hidden',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 18,
    width: '85%',
  },
  cardIcon: { width: '15%' },
  cardPrice: {
    fontSize: 20,
    fontWeight: '700',
    padding: 5,
    color: 'green',
  },
  cardDiscountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    padding: 5,
    color: 'green',
  },
  shimmer: {
    position: 'absolute',
    width: 15,
    height: '200%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.7,
  },
});