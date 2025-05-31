import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SliderButton from '@/components/SliderButton';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useUser } from '@/context/UserContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStockContext } from '@/context/StockContext';
import { useTheme } from '@/utils/theme';

// Types
interface Trade {
  type_id: string;
  type_name: string;
  package_id: string;
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  riskCategory: string;
  minimumInvestment?: string;
  profitPotential?: string;
}

interface TradeDetailsProps {
  trade: Trade;
  colors: any;
}

// Utility Functions
const getISTDate = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 19).replace('T', ' ');
};

const formatCurrency = (amount: string) => {
  return amount && !isNaN(Number(amount)) 
    ? new Intl.NumberFormat('en-IN').format(Number(amount))
    : 'N/A';
};

// Components
const Header: React.FC<{ onBack: () => void; category: string; colors: any }> = ({ onBack, category, colors }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
      <MaterialIcons name="arrow-back" size={24} color={colors.text} />
    </TouchableOpacity>
    <ThemedText type="subtitle" style={{ color: colors.text }}>
      {category}
    </ThemedText>
    <View style={styles.headerSpacer} />
  </View>
);

const PackageHeader: React.FC<{ trade: Trade }> = ({ trade }) => (
  <LinearGradient
    colors={['#04810E', '#039D74']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.cardHeader}
  >
    <View style={styles.titleContainer}>
      <ThemedText style={[styles.title, { color: '#ffffff' }]}>{trade.title}</ThemedText>
      <View style={styles.iconContainer}>
        <MaterialIcons name={trade.icon || 'info'} size={32} color="#ffffff" />
      </View>
    </View>
  </LinearGradient>
);

const PackageDetails: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => {
  const getTagStyle = (riskCategory: string) => {
    if (riskCategory.includes('Low')) return { borderColor: colors.success, icon: 'check-circle' };
    return { borderColor: colors.error, icon: 'error' };
  };

  return (
    <View style={[styles.cardDetails, { 
      backgroundColor: colors.cardBackground,
      borderColor: colors.text,
      borderWidth: 1,
      shadowColor: colors.text,
    }]}>
      <View style={styles.detailRow}>
        <DetailColumn
          label="Min Investment"
          value={`₹ ${formatCurrency(trade.minimumInvestment || '0')}`}
          colors={colors}
        />
        <DetailColumn
          label="Risk Category"
          customContent={
            <View style={[styles.riskTag, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <MaterialIcons
                name={trade.riskCategory ? getTagStyle(trade.riskCategory).icon : 'help-circle'}
                size={18}
                color={colors.text}
              />
              <ThemedText
                style={[styles.detailValue, { color: colors.text }]}>
                {trade.riskCategory || 'N/A'}
              </ThemedText>
            </View>
          }
          colors={colors}
        />
        <DetailColumn
          label="Profit Potential"
          value={trade.profitPotential ? `${trade.profitPotential}%` : 'N/A'}
          colors={colors}
        />
      </View>
    </View>
  );
};

const DetailColumn: React.FC<{ label: string; value?: string; customContent?: React.ReactNode; colors: any }> = ({ 
  label, 
  value, 
  customContent,
  colors 
}) => (
  <View style={styles.detailColumn}>
    <ThemedText style={[styles.detailLabel, { color: colors.text }]}>{label}</ThemedText>
    {customContent || (
      <ThemedText style={[styles.detailValue, { color: colors.text }]}>{value}</ThemedText>
    )}
  </View>
);

const PricingSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={[styles.section, { 
    backgroundColor: colors.cardBackground,
    borderColor: colors.text,
    borderWidth: 1,
    shadowColor: colors.text,
  }]}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Pricing</ThemedText>
    <View style={styles.priceContainer}>
      <ThemedText style={[styles.price, { color: colors.text }]}>
        ₹ {formatCurrency(trade.price)}
      </ThemedText>
      <View style={[styles.priceTag, { backgroundColor: colors.primary + '20' }]}>
        <ThemedText style={[styles.priceTagText, { color: colors.text }]}>Best Value</ThemedText>
      </View>
    </View>
  </View>
);

const DetailsSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={[styles.section, { 
    backgroundColor: colors.cardBackground,
    borderColor: colors.text,
    borderWidth: 1,
    shadowColor: colors.text,
  }]}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>What we offer</ThemedText>
    <View style={styles.detailsList}>
      {trade.details.map((detail, index) => (
        <View key={index} style={styles.detailItem}>
          <View style={[styles.checkIconContainer, { backgroundColor: colors.success + '20' }]}>
            <MaterialIcons name="check" size={16} color={colors.success} />
          </View>
          <ThemedText style={[styles.detailText, { color: colors.text }]}>{detail}</ThemedText>
        </View>
      ))}
    </View>
  </View>
);

// Memoize child components
const MemoizedPackageHeader = React.memo(PackageHeader);
const MemoizedPackageDetails = React.memo(PackageDetails);
const MemoizedPricingSection = React.memo(PricingSection);
const MemoizedDetailsSection = React.memo(DetailsSection);

// Main Component
export default function TradeDetails() {
  const { userDetails, purchasedPackagesId } = useUser();
  const { packages } = useStockContext();
  const params = useLocalSearchParams();
  const themeColors = useTheme();
  const colors = useMemo(() => ({
    ...themeColors,
    gradientStart: '#00b300',
    gradientEnd: '#00c853',
  }), [themeColors]);
  
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Animation values
  const slideAnim1 = useRef(new Animated.Value(-100)).current;
  const slideAnim2 = useRef(new Animated.Value(-100)).current;
  const slideAnim3 = useRef(new Animated.Value(-100)).current;
  const slideAnim4 = useRef(new Animated.Value(-100)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;

  // Memoize trade data
  const trade = useMemo(() => {
    if (!params.package_id) return undefined;
    
    if (params.title && params.details) {
      return {
        package_id: params.package_id as string,
        title: params.title as string,
        price: params.price as string,
        details: JSON.parse(params.details as string),
        categoryTag: params.categoryTag as string,
        icon: params.icon as string,
        riskCategory: params.riskCategory as string,
        minimumInvestment: params.minimumInvestment as string,
        profitPotential: params.profitPotential as string,
        type_id: '',
        type_name: '',
      };
    }
    return packages.find((pkg) => pkg.package_id === params.package_id);
  }, [params, packages]);

  // Optimize animations
  useEffect(() => {
    const animations = Animated.parallel([
      Animated.sequence([
        Animated.timing(slideAnim1, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim2, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim3, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim4, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(buttonSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
    ]);

    animations.start();
    return () => animations.stop();
  }, []);

  // Memoize handlers
  const handlePayment = useCallback(async () => {
    const transaction_id = `TXN_${Date.now()}`;
    const payment_date = getISTDate();
    const amount = Number(trade?.price);

    if (isNaN(amount)) {
      alert('Invalid package price. Cannot proceed with payment.');
      return;
    }

    try {
      await AsyncStorage.setItem(
        'transactionDetails',
        JSON.stringify({
          package_id: trade?.package_id,
          user_id: userDetails?.user_id,
          amount: trade?.price,
          payment_date,
          transaction_id,
        })
      );

      setIsRedirecting(true);
      const result = await axios.post('https://tradedge-server.onrender.com/api/paymentURL', {
        redirectUrl: `tradedge://paymentResult`,
        amount,
        user_id: userDetails?.user_id,
        package_id: trade?.package_id,
        transaction_id,
        payment_date,
      });

      const paymentUrl = result.data.redirectUrl;
      await Linking.openURL(paymentUrl);
    } catch (error) {
      console.error('Error during payment:', error);
      alert('Failed to open the URL. Please try again later.');
    } finally {
      setIsRedirecting(false);
    }
  }, [trade, userDetails]);

  if (!trade) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={{ color: colors.text }}>Trade details not found.</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (isRedirecting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>Redirecting...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        onBack={() => router.back()} 
        category={trade.categoryTag} 
        colors={colors} 
      />

      <ScrollView 
        contentContainerStyle={styles.content}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim1 }] }}>
          <MemoizedPackageHeader trade={trade} />
        </Animated.View>
        
        <Animated.View style={{ transform: [{ translateX: slideAnim2 }] }}>
          <MemoizedPackageDetails trade={trade} colors={colors} />
        </Animated.View>
        
        <Animated.View style={{ transform: [{ translateX: slideAnim3 }] }}>
          <MemoizedPricingSection trade={trade} colors={colors} />
        </Animated.View>
        
        <Animated.View style={{ transform: [{ translateX: slideAnim4 }] }}>
          <MemoizedDetailsSection trade={trade} colors={colors} />
        </Animated.View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.buttonContainer, 
          { 
            backgroundColor: colors.background,
            transform: [{ translateY: buttonSlideAnim }]
          }
        ]}
      >
        {purchasedPackagesId.includes(trade.package_id) ? (
          <ThemedText type="defaultSemiBold" style={{ color: colors.success }}>
            Subscribed
          </ThemedText>
        ) : (
          <SliderButton 
            name="Subscribe" 
            colors={{ buttonPrimary: colors.primary }} 
            onPress={handlePayment} 
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  priceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cardDetails: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailColumn: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  riskTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});