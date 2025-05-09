// app/(tabs)/home/TradeCard.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import CircleBackgroundView from '@/animation/CircleAnimation';
import { router } from 'expo-router';
import { useTheme } from '@/utils/theme' 

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
  const colors = useTheme();
  const handleTradePress = () => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        package_id: item.package_id,
      },
    });
  };

  return (
    <ThemedView style={[styles.tradeCardContainer, { shadowColor: colors.shadowColor, backgroundColor: 'rgb(180, 180, 180)' }]}>
      <TouchableOpacity onPress={handleTradePress} activeOpacity={0.7}>
        <ThemedView style={[styles.tradeCardHeader, {}]}>
          <ThemedText style={[styles.tradeCardTitle, { color: 'black' }]}>{item.title}</ThemedText>
          <MaterialIcons style={[styles.cardIcon, { color: 'black' }]} name={item.icon} size={26} color={colors.text} />
        </ThemedView>
        <CircleBackgroundView
          size={400}
          colors={['rgb(255, 255, 255)', 'rgb(46, 46, 46)']}
          duration={2000}
          delay={400}
          ringCount={1}
          style={{
            height: '81%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgb(29, 29, 29)',
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
                backgroundColor: '#388E3C',
                color: 'white',
                borderRadius: 5,
                marginVertical: '18%',
                textAlignVertical: 'center',
              },
            ]}
          >
            ₹ {item.price ? new Intl.NumberFormat('en-IN').format(Number(item.price)) : 'N/A'}/-
          </ThemedText>
          <View>
            <LinearGradient
              colors={['rgb(255, 171, 0)', 'rgb(239, 159, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderWidth: 1,
                borderColor: 'black',
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
    borderColor: 'grey',
    paddingBottom: 5,
    height: 30,
  },
  tradeCardTitle: {
    fontWeight: '700',
    fontSize: 15,
    width: '85%',
  },
  cardIcon: { width: '15%' },
  cardDiscountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    padding: 5,
    color: 'green',
  },
});