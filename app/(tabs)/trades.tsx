import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Dimensions,
  Text,
  Button,
  Linking,
  FlatList,
  RefreshControl
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useStockContext } from '@/context/StockContext';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useTheme, ThemeColors } from '@/utils/theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { BadgeCheck, BadgeIndianRupeeIcon } from 'lucide-react-native';
import { TrendingUp, TrendingDown, Clock, Calendar, AlertTriangle, TrendingUpIcon } from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedButton';
import { AnimatedLinkButton } from '@/components/AnimatedLinkButton';

type Package = {
  type_id: string;
  type_name: string;
  package_id: string;
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  minimumInvestment?: string;
  riskCategory?: string;
  profitPotential?: string;
};

const { width } = Dimensions.get('window');

interface TradeTip {
  id: string;
  stockSymbol: string;
  stockName: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  timeFrame: string;
  prediction: {
    type: 'bullish' | 'bearish';
    confidence: number;
    potentialProfit: number;
    potentialLoss: number;
  };
  analysis: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendedInvestment: number;
  timestamp: string;
}

export default function Trades() {
  // const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';

  const colors = useTheme();

  const { packages, loading } = useStockContext();

  const uniqueTags = [...new Set(packages.map((pack) => pack.categoryTag))] as string[];
  const tags = uniqueTags.length > 0 ? uniqueTags : [''];
  const [selectedTag, setSelectedTag] = useState<string>(tags[0]);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('Today');

  // Mock data - Replace with actual API data
  const tradeTips: TradeTip[] = [
    {
      id: '1',
      stockSymbol: 'RELIANCE',
      stockName: 'Reliance Industries',
      entryPrice: 2450.75,
      targetPrice: 2600.00,
      stopLoss: 2400.00,
      timeFrame: '1 Week',
      prediction: {
        type: 'bullish',
        confidence: 85,
        potentialProfit: 6.1,
        potentialLoss: 2.1,
      },
      analysis: 'Strong technical breakout with increasing volume. Support at 2400.',
      riskLevel: 'Medium',
      recommendedInvestment: 50000,
      timestamp: '2024-03-20T10:30:00',
    },
    {
      id: '2',
      stockSymbol: 'TCS',
      stockName: 'Tata Consultancy Services',
      entryPrice: 3850.25,
      targetPrice: 4000.00,
      stopLoss: 3750.00,
      timeFrame: '2 Weeks',
      prediction: {
        type: 'bullish',
        confidence: 75,
        potentialProfit: 3.9,
        potentialLoss: 2.6,
      },
      analysis: 'Positive earnings outlook with strong institutional buying.',
      riskLevel: 'Low',
      recommendedInvestment: 75000,
      timestamp: '2024-03-20T09:15:00',
    },
    // Add more mock data as needed
  ];

  const timeFrames = ['All', 'Today'];

  const getTagStyle = (riskCategory: string): { color: string; icon: string } => {
    if (riskCategory.includes('Low')) return { color: colors.success, icon: 'check-circle' };
    return { color: colors.error, icon: 'error' };
  };

  const handleTradePress = (item: Package) => {
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

  const filteredServices = packages.map((pack) => ({
    ...pack,
  })).filter((item) => item.categoryTag === selectedTag);

  const renderTradeTip = ({ item }: { item: TradeTip }) => (
    <ThemedView style={[styles.tradeCard, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="title" style={[styles.stockSymbol, { color: colors.text }]}>
            {item.stockSymbol}
          </ThemedText>
          <ThemedText type="subtitle" style={[styles.stockName, { color: colors.text }]}>
            {item.stockName}
          </ThemedText>
          <View style={[styles.dateContainer, { marginTop: 4 }]}>
            <Calendar size={14} color={colors.text} style={{ marginRight: 4, opacity: 0.7 }} />
            <ThemedText type="default" style={[styles.dateText, { color: colors.text }]}>
              {new Date(item.timestamp).toLocaleDateString()}
            </ThemedText>
            <Clock size={14} color={colors.text} style={{ marginLeft: 8, marginRight: 4, opacity: 0.7 }} />
            <ThemedText type="default" style={[styles.dateText, { color: colors.text }]}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.predictionBadge}>
          <MaterialIcons
            name={item.prediction.type === 'bullish' ? 'trending-up' : 'trending-down'}
            size={24}
            color={item.prediction.type === 'bullish' ? colors.success : colors.error}
          />
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.predictionText,
              { color: item.prediction.type === 'bullish' ? colors.success : colors.error },
            ]}
          >
            {item.prediction.type === 'bullish' ? 'Bullish' : 'Bearish'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceBox}>
          <ThemedText type="subtitle" style={[styles.priceLabel, { color: colors.text }]}>
            Entry
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.priceValue, { color: colors.text }]}>
            ₹{item.entryPrice.toLocaleString()}
          </ThemedText>
        </View>
        <View style={styles.priceBox}>
          <ThemedText type="subtitle" style={[styles.priceLabel, { color: colors.text }]}>
            Target
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.priceValue, { color: colors.success }]}>
            ₹{item.targetPrice.toLocaleString()}
          </ThemedText>
        </View>
        <View style={styles.priceBox}>
          <ThemedText type="subtitle" style={[styles.priceLabel, { color: colors.text }]}>
            Stop Loss
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.priceValue, { color: colors.error }]}>
            ₹{item.stopLoss.toLocaleString()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.predictionContainer}>
        <View style={styles.predictionBox}>
          <TrendingUp size={20} color={colors.success} />
          <ThemedText type="default" style={[styles.predictionValue, { color: colors.success }]}>
            +{item.prediction.potentialProfit}%
          </ThemedText>
        </View>
        <View style={styles.predictionBox}>
          <TrendingDown size={20} color={colors.error} />
          <ThemedText type="default" style={[styles.predictionValue, { color: colors.error }]}>
            -{item.prediction.potentialLoss}%
          </ThemedText>
        </View>
        <View style={styles.predictionBox}>
          <Clock size={20} color={colors.text} />
          <ThemedText type="default" style={[styles.predictionValue, { color: colors.text }]}>
            {item.timeFrame}
          </ThemedText>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.riskContainer}>
          <AlertTriangle size={20} color={themedColors.warning} />
          <ThemedText type="default" style={[styles.riskText, { color: themedColors.text }]}>
            Risk: {item.riskLevel}
          </ThemedText>
        </View>
        <View style={styles.investmentContainer}>
          <TrendingUpIcon size={20} color="#8A2BE2" />
          <View>
            <ThemedText type="defaultSemiBold" style={[styles.profitPercentage, { color: '#8A2BE2' }]}>
              {item.prediction.potentialProfit}%
            </ThemedText>
            <ThemedText type="default" style={[styles.profitLabel, { color: colors.text }]}>
              Profit Potential
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <AnimatedButton
          title="Enquiry"
          icon={<FontAwesome name="phone" size={14} color={colors.card} style={{ marginRight: 5 }} />}
          onPress={() => Linking.openURL('tel:7400330785')}
          variant="secondary"
          style={{ flex: 1 }}
        />

        <AnimatedButton
          title="Buy"
          icon={<FontAwesome name="shopping-cart" size={14} color={colors.card} style={{ marginRight: 5 }} />}
          onPress={() => {
            console.log('Buy action for:', item.stockSymbol);
          }}
          gradient
          pulseAnimation={true}
          style={{ flex: 1 }}
        />
      </View>
    </ThemedView>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Add missing color properties to ThemeColors type or provide fallbacks
  // Assuming these colors should exist in your theme or need default values
  const themedColors = colors as ThemeColors & {
    warning: string;
    selectedTagBackground: string;
    selectedTagText: string;
    tagText: string;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Trading Tips" />
      
      {/* Fixed Tags Bar */}
      <View style={[styles.tagSection, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          {timeFrames.map((timeFrame) => (
            <TouchableOpacity
              key={timeFrame}
              activeOpacity={0.8}
              onPress={() => setSelectedTimeFrame(timeFrame)}
              style={[
                styles.tagButton,
                {
                  backgroundColor: selectedTimeFrame === timeFrame ? themedColors.selectedTagBackground : themedColors.tagBackground,
                  borderColor: themedColors.border,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.tradeTagText,
                  { color: selectedTimeFrame === timeFrame ? themedColors.selectedTagText : themedColors.tagText },
                ]}
              >
                {timeFrame}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={tradeTips}
        renderItem={renderTradeTip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  textDark: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  tagSection: {
    paddingTop: 10,
    marginBottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    width: '100%',
  },
  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTagText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: 'grey',
    fontSize: 14,
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailBox: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingBottom: 6,
    alignItems: 'center',
  },
  detailIcon: {
    alignSelf: 'flex-end',
    marginRight: 2,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '300',
    marginBottom: 0,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enquiryButton: {
    flex: 1 / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  buyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  timeFrameContainer: {
    maxHeight: 50,
    marginVertical: 8,
  },
  timeFrameContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  timeFrameButton: {
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeFrameText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  tradeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  stockSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stockName: {
    fontSize: 14,
    opacity: 0.7,
  },
  predictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  predictionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceBox: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  predictionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  predictionValue: {
    marginLeft: 4,
    fontSize: 14,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskText: {
    marginLeft: 4,
    fontSize: 14,
  },
  investmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  investmentText: {
    marginLeft: 4,
    fontSize: 14,
  },
  profitPercentage: {
    fontSize: 18,
    fontWeight: '600',
  },
  profitLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
});