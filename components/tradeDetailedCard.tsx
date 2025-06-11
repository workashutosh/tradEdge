import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import CircleBackgroundView from '@/animation/CircleAnimation';
import { router } from 'expo-router';
import { useTheme, ThemeHookReturn } from '@/utils/theme';
import { useLocalSearchParams } from 'expo-router';

interface TradeCards {
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

interface TradeCardProps {
  item: TradeCards;
}

export default function TradeCard({ item }: TradeCardProps) {
  const colors: ThemeHookReturn = useTheme();
  const textColor = colors.isDarkMode ? '#FFFFFF' : '#000000';

  // Check if item exists before accessing properties
  if (!item) {
    return null; // or some fallback UI
  }


  const package_id = item.package_id;
  const title = item.title;
  const price = item.price || '';
  const details = JSON.stringify(item.details);
  const categoryTag = item.categoryTag;
  const icon = item.icon;
  const riskCategory = item.riskCategory;
  const minimumInvestment = item.minimumInvestment || '';
  const profitPotential = item.profitPotential || '';

  const handleTradePress = () => {
    const query = new URLSearchParams({
      package_id,
      title,
      price,
      details,
      categoryTag,
      icon,
      riskCategory,
      minimumInvestment,
      profitPotential,
    }).toString();

    router.push(`/tradeDetailedCard?${query}`);
  };

  const displayPrice = item.price ? new Intl.NumberFormat('en-IN').format(Number(item.price)) : 'N/A';

  return (
    <ThemedView
      style={[
        styles.tradeCardContainer,
        {
          shadowColor: colors.shadowColor,
          backgroundColor: colors.isDarkMode ? colors.card : '#E3F2FD',
        },
      ]}
    >
      <TouchableOpacity onPress={handleTradePress} activeOpacity={0.7}>
        {/* Header */}
        <ThemedView style={[styles.tradeCardHeader, { borderColor: colors.border }]}>
          <ThemedText style={[styles.tradeCardTitle, { color: textColor }]}>
            {item.title}
          </ThemedText>
          <MaterialIcons
            style={[styles.cardIcon, { color: textColor }]}
            name={item.icon}
            size={26}
            color={textColor}
          />
        </ThemedView>

        {/* Animated Circle */}
        <CircleBackgroundView
          size={400}
          colors={
            colors.isDarkMode
              ? [colors.border, colors.text]
              : ['rgb(187, 222, 251)', 'rgb(144, 202, 249)']
          }
          duration={2000}
          delay={400}
          ringCount={1}
          style={{
            height: '81%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <ThemedText
            style={[
              styles.cardDiscountedPrice,
              {
                alignSelf: 'center',
                justifyContent: 'center',
                backgroundColor: colors.success,
                color: '#FFFFFF',
                borderRadius: 5,
                marginVertical: '18%',
                textAlignVertical: 'center',
              },
            ]}
          >
            ₹ {displayPrice}/-
          </ThemedText>

          {/* Subscribe Button */}
          <View>
            <LinearGradient
              colors={
                colors.isDarkMode
                  ? [colors.primary, colors.primary]
                  : ['rgb(255, 171, 0)', 'rgb(239, 159, 0)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 15,
                paddingVertical: 5,
                borderRadius: 20,
                alignSelf: 'center',
              }}
            >
              <ThemedText style={{ fontWeight: '600' }}>Subscribe</ThemedText>
            </LinearGradient>
          </View>
        </CircleBackgroundView>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tradeCardContainer: {
    height: 180,
    width: '48%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  tradeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingBottom: 5,
    height: 30,
  },
  tradeCardTitle: {
    fontWeight: '700',
    fontSize: 15,
    width: '85%',
  },
  cardIcon: {
    width: '15%',
  },
  cardDiscountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    padding: 5,
  },
});
