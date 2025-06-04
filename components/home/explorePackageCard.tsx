// app/(tabs)/home/ExplorePackageCard.tsx
import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStockContext } from '@/context/StockContext';
import { useTheme, ThemeHookReturn } from '@/utils/theme';

interface Package {
  type_id: string;
  type_name: string;
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
  item: Package;
  shimmerAnim: Animated.Value;
}

export default function ExplorePackageCard({ item, shimmerAnim }: ExplorePackageCardProps) {
  const colors: ThemeHookReturn = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = React.useState(false);

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 1.06,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };
  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleTradePress = () => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        package_id: item.package_id,
        title: item.title,
        price: item.price || '',
        details: JSON.stringify(item.details),
        categoryTag: item.categoryTag,
        icon: item.icon,
        riskCategory: item.riskCategory,
        minimumInvestment: item.minimumInvestment || '',
        profitPotential: item.profitPotential || '',
      },
    });
  };

  const displayPrice = item.price && !isNaN(Number(item.price)) ? new Intl.NumberFormat('en-IN').format(Number(item.price)) : 'N/A';
  const displayMinimumInvestment = item.minimumInvestment && !isNaN(Number(item.minimumInvestment)) ? new Intl.NumberFormat('en-IN').format(Number(item.minimumInvestment)) : 'N/A';
  const displayProfitPotential = item.profitPotential ? `${item.profitPotential}%` : 'N/A';

  return (
    <Pressable
      onPress={handleTradePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1 }}
    >
      <Animated.View style={[
        styles.cardContainer,
        {
          shadowColor: colors.shadowColor,
          backgroundColor: pressed ? colors.success : (colors.isDarkMode ? colors.success : colors.vgreen),
          transform: [{ scale: scaleAnim }],
        },
      ]}>
        <ThemedView style={[styles.cardHeader, { borderBottomColor: colors.isDarkMode ? colors.border : 'rgba(255, 255, 255, 0.2)' }]}>
          <ThemedText
            style={[styles.cardTitle, { color: colors.isDarkMode ? colors.text : '#FFFFFF' }]}
          >
            {item.title}
          </ThemedText>
          <MaterialIcons 
            style={styles.cardIcon} 
            name={item.icon} 
            size={26} 
            color={colors.isDarkMode ? colors.text : '#FFFFFF'} 
          />
        </ThemedView>
        <ThemedView style={styles.cardBody}>
          <ThemedText style={{ color: colors.isDarkMode ? colors.text : '#FFFFFF' }}>{item.details[0]}</ThemedText>
          <View style={{ flexDirection: 'row', gap: 3, paddingTop: 8 }}>
            <Check color={colors.isDarkMode ? colors.text : '#FFFFFF'} size={24} />
            <ThemedText style={{ color: colors.isDarkMode ? colors.text : '#FFFFFF' }}>Daily calls</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: 3, paddingBottom: 8 }}>
            <Check color={colors.isDarkMode ? colors.text : '#FFFFFF'} size={24} />
            <ThemedText style={{ color: colors.isDarkMode ? colors.text : '#FFFFFF' }}>Profit margin 80%</ThemedText>
          </View>
        </ThemedView>
        <ThemedView style={[styles.cardFooter, { borderTopColor: colors.isDarkMode ? colors.border : 'rgba(255, 255, 255, 0.2)' }]}>
          <Animated.View
            style={[
              styles.shimmer,
              { 
                transform: [{ translateX: shimmerAnim }, { rotate: '35deg' }],
                backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.3)', // High opacity white for dark mode
                width: colors.isDarkMode ? 200 : 150, // Wider shimmer in dark mode
              },
            ]}
          />
          <ThemedView style={styles.priceContainer}>
            <ThemedText style={[styles.cardPrice, { textDecorationLine: 'line-through', color: colors.isDarkMode ? colors.text : '#FFFFFF' }]}>
              ₹ {displayPrice}
            </ThemedText>
            <LinearGradient
              colors={colors.isDarkMode ? 
                ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)'] : 
                ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.discountContainer}
            >
              <ThemedText style={[styles.cardDiscountedPrice, { marginLeft: 8, color: colors.isDarkMode ? colors.text : '#FFFFFF' }]}>
                ₹ 1,999/-
              </ThemedText>
            </LinearGradient>
          </ThemedView>
        </ThemedView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 280,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardIcon: {
    marginLeft: 8,
  },
  cardBody: {
    padding: 16,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 100, // Default width, will be overridden by inline style
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontSize: 16,
    opacity: 0.7,
  },
  discountContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardDiscountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    padding: 5,
  },
});