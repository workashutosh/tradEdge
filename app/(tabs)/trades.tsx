import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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
  RefreshControl,
  Animated,
  Easing,
  Alert
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
import TradeNotifications  from '@/components/websocket_server';



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

  // Memoize unique tags calculation
  const uniqueTags = useMemo(() => 
    [...new Set(packages.map((pack) => pack.categoryTag))] as string[],
    [packages]
  );
  const tags = uniqueTags.length > 0 ? uniqueTags : [''];
  const [selectedTag, setSelectedTag] = useState<string>(tags[0]);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('All');

  // Memoize filtered services
  const filteredServices = useMemo(() => 
    packages.filter((item) => item.categoryTag === selectedTag),
    [packages, selectedTag]
  );

  // Mock data - Replace with actual API data
  const [tradeTips, setTradeTips] = useState<TradeTip[]>([
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
  ]);

  { /* // WebSocket client setup
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.1.20:9090');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.tradeTip) {
          // Add new trade tip notification to the list
          setTradeTips((prevTips) => [data.tradeTip, ...prevTips]);
          // Optionally show an alert or notification
          Alert.alert('New Trade Notification', `Stock: ${data.tradeTip.stockName}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []); */ }

  // Memoize animation values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonRotation = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // Memoize animation function
  const animateButton = useCallback(() => {
    // Reset values
    buttonScale.setValue(1);
    buttonOpacity.setValue(1);
    buttonRotation.setValue(0);
    buttonTranslateY.setValue(0);

    Animated.sequence([
      // Press down animation
      Animated.parallel([
        Animated.timing(buttonScale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRotation, {
          toValue: -0.05,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 2,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      // Pop up animation
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1.15,
          friction: 2,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(buttonRotation, {
          toValue: 0.05,
          friction: 2,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: -4,
          friction: 2,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Bounce back animation
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(buttonRotation, {
          toValue: 0,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [buttonScale, buttonOpacity, buttonRotation, buttonTranslateY]);

  

  // Memoize render functions
  const renderTradeTip = useCallback(({ item }: { item: TradeTip }) => (
    <ThemedView style={[styles.tradeCard, { backgroundColor: colors.card }]}> 
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <ThemedText type="title" style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 2 }}>{item.stockName.toUpperCase()}</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <ThemedText type="subtitle" style={{ color: colors.text, fontSize: 13, opacity: 0.7 }}>{new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</ThemedText>
              <ThemedText type="subtitle" style={{ color: colors.text, fontSize: 13, opacity: 0.7, marginLeft: 8 }}>{item.timeFrame}</ThemedText>
            </View>
          </View>
          <ThemedText type="title" style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>₹ {item.entryPrice.toFixed(2)}</ThemedText>
        </View>

        {/* Profit, Target, Stop Loss */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <ThemedText style={{ color: colors.text, fontSize: 13, opacity: 0.7 }}>Profit Potential</ThemedText>
            <ThemedText style={{ color: colors.success, fontSize: 18, fontWeight: '700' }}>{item.prediction.potentialProfit}%</ThemedText>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <ThemedText style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>₹ {item.targetPrice.toFixed(2)}</ThemedText>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <ThemedText style={{ color: colors.error, fontSize: 18, fontWeight: '700' }}>₹ {item.stopLoss.toFixed(2)}</ThemedText>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.cardFooter, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 0, paddingTop: 0, paddingBottom: 0, minHeight: undefined, height: 48 }]}> 
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <TouchableOpacity
              onPress={() => Linking.openURL('tel:7400330785')}
              style={[
                styles.actionButtonFooterCompact,
                {
                  flex: 1,
                  marginRight: 6,
                  borderWidth: 1,
                  borderColor: colors.isDarkMode ? '#fff' : '#222',
                  backgroundColor: colors.isDarkMode ? '#222' : '#fff',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0
                }
              ]}
            >
              <FontAwesome name="phone" size={12} color={colors.text} style={{ marginRight: 4 }} />
              <ThemedText style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>Support</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // Navigate to TradeDetailedCard and pass all trade tip details as params
                router.push({
                  pathname: '/main/TradeDetailedCard',
                  params: {
                    stockSymbol: item.stockSymbol,
                    stockName: item.stockName,
                    entryPrice: item.entryPrice,
                    targetPrice: item.targetPrice,
                    stopLoss: item.stopLoss,
                    timeFrame: item.timeFrame,
                    analysis: item.analysis,
                    riskLevel: item.riskLevel,
                    recommendedInvestment: item.recommendedInvestment,
                    timestamp: item.timestamp,
                    confidence: item.prediction.confidence,
                    potentialProfit: item.prediction.potentialProfit,
                    potentialLoss: item.prediction.potentialLoss,
                    predictionType: item.prediction.type,
                  },
                });
              }}
              style={[
                styles.actionButtonFooterCompact,
                {
                  flex: 1,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  marginLeft: 0,
                  backgroundColor: colors.info || '#007bff', // Use info color or blue
                  borderWidth: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              ]}
            >
              <FontAwesome name="info-circle" size={14} color={'#fff'} style={{ marginRight: 4 }} />
              <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>More Info</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  ), [colors, animateButton]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Memoize timeFrames array
  const timeFrames = useMemo(() => ['All', 'Today'], []);

  // Memoize getTagStyle function
  const getTagStyle = useCallback((riskCategory: string): { color: string; icon: string } => {
    if (riskCategory.includes('Low')) return { color: colors.success, icon: 'check-circle' };
    return { color: colors.error, icon: 'error' };
  }, [colors]);

  // Memoize handleTradePress function
  const handleTradePress = useCallback((item: Package) => {
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

        {/* Notifications */}
      <TradeNotifications />

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
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
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
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  textDark: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  tagSection: {
    paddingTop: 6,
    marginBottom: 3,
    width: '100%',
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  tagScroll: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 6,
    width: '100%',
  },
  tagButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTagText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
    paddingTop: 3,
  },
  tradeCard: {
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    // Add border and shadow for trade box
    borderWidth: 1.5,
    borderColor: '#e0e0e0', // subtle light border
    backgroundColor: '#fff', // ensure shadow is visible on light bg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6, // for Android shadow
  },
  cardGradient: {
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 8,
  },
  stockInfo: {
    flex: 1,
    marginRight: 6,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 1,
  },
  stockName: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    opacity: 0.6,
  },
  currentPriceContainer: {
    alignItems: 'flex-end',
  },
  detailsContainer: {
    marginVertical: 4, // reduced from 8
    paddingHorizontal: 0,
  },
  detailsRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 2, // reduced from 6
  },
  detailsRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 0, // ensure no extra space
  },
  detailColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 0, // reduced from 2
  },
  detailLabel: {
    fontSize: 13, // increased from 11
    opacity: 0.8,
    marginBottom: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 17, // increased from 14
    fontWeight: '600',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: undefined,
    height: 48,
  },
  buttonContainerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  buttonContainerFooterCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 0,
  },
  actionButtonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonFooterCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minHeight: 32,
    backgroundColor: '#222',
  },
});
