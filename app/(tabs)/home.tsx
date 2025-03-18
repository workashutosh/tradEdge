import { Image, StyleSheet, Animated, Platform, TouchableOpacity, useColorScheme, SafeAreaView, View, FlatList, ScrollView, Linking, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightIcon, Sparkles } from 'lucide-react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStockContext } from '@/context/StockContext';
import { Modal } from 'react-native';

export default function HomeScreen() {
  const [username, setUsername] = useState('User');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const { NSEData, BSEData, marketIndices, updateNSEData, updateBSEData, updateMarketIndices } = useStockContext();
  const stocks = ["nifty 200", "nifty 50", "nifty auto", "nifty bank", "sensex", "nifty infra", "nifty it", "nifty metal", "nifty pharma", "nifty psu bank"];

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#f5f7fa',
    headerBackground: isDark ? '#1e1e1e' : '#ffffff',
    headerBorderBottom: isDark ? '#2d2d2d' : '#eef1f5',
    text: isDark ? '#ffffff' : '#333333',
    buttonPrimary: '#6200ee',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    error: '#ff4444',
    primary: '#6200ee',
    success: '#00c853',
    warning: '#ffab00',
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7',
    shadowColor: isDark ? "rgb(128, 128, 128)" : "rgb(0, 0, 0)",
  };

  interface MarketIndicesData {
    ticker: string;
    percentChange: number;
  }

  interface StockData {
    ticker: string;
    price: number;
    netChange: number;
    percentChange: number;
    high: number;
    low: number;
  }

  interface TradeCards {
    title: string;
    price: string;
    details: string[];
    categoryTag: string;
    icon: string;
    tags: string[];
    color: string;
  }

  interface ServiceItem {
    isShowMore?: boolean;
    title: string;
    price: string;
    details: string[];
    categoryTag: string;
    icon: string;
    tags: string[];
    color: string;
  }

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('user_name');
        if (storedUsername) setUsername(storedUsername);
      } catch (error) {
        console.log('Error loading username:', error);
      }
    };
    loadUsername();
  }, []);

  const getMarketIndices = async () => {
    try {
      const results: MarketIndicesData[] = [];
      for (const st of stocks) {
        const response = await fetch(
          `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${st}`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
              'x-rapidapi-host': process.env.EXPO_PUBLIC_RAPID_API_HOST || '',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          console.error(`Stock not found: ${st}`);
          continue;
        }

        const stockData: MarketIndicesData = {
          ticker: st.toUpperCase(),
          percentChange: data.percentChange,
        };
        results.push(stockData);
      }
      updateMarketIndices(results);
    } catch (error) {
      console.error('Error fetching market indices:', error);
    }
  };

  const getNSEBSEStocks = async (stock: string) => {
    try {
      const response = await fetch(
        `https://indian-stock-exchange-api2.p.rapidapi.com/${stock}_most_active`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
            'x-rapidapi-host': process.env.EXPO_PUBLIC_RAPID_API_HOST || '',
          },
        }
      );

      const data = await response.json();
      if (data.error) {
        console.error('Error fetching most active stocks');
      } else {
        const formattedData: StockData[] = data.map((stock: any) => ({
          ticker: stock.ticker,
          price: stock.price,
          netChange: stock.net_change,
          percentChange: stock.percent_change,
          high: stock.high,
          low: stock.low,
        }));
        if (stock === "NSE") updateNSEData(formattedData);
        if (stock === "BSE") updateBSEData(formattedData);
      }
    } catch (err) {
      console.error(`Failed to fetch ${stock} data`);
    }
  };

  const ourServices: ServiceItem[] = [
    {
      title: 'Cash Intraday',
      price: '₹9,500',
      details: [
        'Intraday calls for cash market with daily recommendations.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Equity',
      icon: 'trending-up',
      tags: ['Moderate Risk', 'Avg ₹2,384/trade'],
      color: colors.primary,
    },
    {
      title: 'Index Futures',
      price: '₹9,000',
      details: [
        'NIFTY & BANKNIFTY futures with precise entries.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Future',
      icon: 'bar-chart',
      tags: ['Moderate Risk', 'Avg ₹4,299/trade'],
      color: colors.warning,
    },
    {
      title: 'Stock Options',
      price: '₹9,500',
      details: [
        'High-accuracy options trading calls.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Stock Option',
      icon: 'tune',
      tags: ['High Risk', 'Avg ₹3,524/trade'],
      color: colors.buttonPrimary,
    },
    {
      title: 'Index Options',
      price: '₹9,000',
      details: [
        'Strategic trading for index options.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Option',
      icon: 'tune',
      tags: ['Moderate Risk', 'Avg ₹3,126/trade'],
      color: colors.error,
    },
  ];

  const tradesCards: TradeCards[] = [
    {
      title: 'Cash Intraday',
      price: '₹9,500',
      details: [
        'Intraday calls for cash market with daily recommendations.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Equity',
      icon: 'trending-up',
      tags: ['Moderate Risk', 'Avg ₹2,384/trade'],
      color: colors.primary,
    },
    {
      title: 'Index Futures',
      price: '₹9,000',
      details: [
        'NIFTY & BANKNIFTY futures with precise entries.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Future',
      icon: 'bar-chart',
      tags: ['Moderate Risk', 'Avg ₹4,299/trade'],
      color: colors.success,
    },
    {
      title: 'Index Options',
      price: '₹9,000',
      details: [
        'Strategic trading for index options.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Option',
      icon: 'tune',
      tags: ['Moderate Risk', 'Avg ₹3,126/trade'],
      color: colors.warning,
    },
    {
      title: 'Stock Options',
      price: '₹9,500',
      details: [
        'High-accuracy options trading calls.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Stock Option',
      icon: 'tune',
      tags: ['High Risk', 'Avg ₹3,524/trade'],
      color: colors.error,
    },
  ];

  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
    return () => scaleValue.stopAnimation();
  }, [scaleValue]);

  const handleTradePress = (item: TradeCards) => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        title: item.title,
        price: item.price,
        details: JSON.stringify(item.details),
        categoryTag: item.categoryTag,
        icon: item.icon,
        tags: JSON.stringify(item.tags),
      },
    });
  };

  const renderMarketIndex = ({ ticker, percentChange }: MarketIndicesData) => {
    const isNegative = percentChange < 0;
    return (
      <ThemedView style={[styles.marketIndexItem]}>
        <ThemedText style={[styles.indexText, { color: 'white' }]}>
          {ticker} {' '}
          <ThemedText style={{ color: isNegative ? colors.error : colors.success }}>
            {isNegative ? '▼' : '▲'} {percentChange}% {' '}
          </ThemedText>
        </ThemedText>
      </ThemedView>
    );
  };

  const renderOurServicesItem = ({ item }: { item: ServiceItem }) => (
    <ThemedView style={[styles.ourServicesCardContainer, { borderLeftColor: item.color, shadowColor: colors.shadowColor }]}>
      <TouchableOpacity onPress={() => handleTradePress(item)}>
        <View style={[styles.ourServicesCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
          <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>
            {item.details[0]}
          </ThemedText>
          <ThemedText style={[styles.cardDescription, { color: colors.text, fontWeight: "600" }]}>
            Price: {item.price}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );

  const rendertradesCard = ({ item }: { item: TradeCards }) => (
    <ThemedView style={[styles.bestTradesCardContainer, { borderLeftColor: item.color, shadowColor: colors.shadowColor }]}>
      <TouchableOpacity onPress={() => handleTradePress(item)}>
        <View style={[styles.bestTradesCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
          <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>
            {item.details[0]}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );

  const NSEBSECard = ({ item }: { item: StockData }) => {
    const isGain = item.netChange > 0;
    return (
      <ThemedView style={[styles.NSEBSECard, { borderColor: isGain ? "green" : "red", backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
        <ThemedText style={[styles.cardTitle, { color: isGain ? 'green' : 'red', fontSize: 15 }]}>
          {item.ticker} {isGain ? '▲' : '▼'} {item.percentChange}%
        </ThemedText>
        <ThemedView style={[{ backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>{item.price}</ThemedText>
          <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>H: {item.high} L: {item.low}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {overlayVisible && (
        <View style={[styles.overlay, { zIndex: overlayVisible ? 10 : -1 }]}>
          <View style={[{ }]}>
          </View>
        </View>
      )}

      <View style={[styles.header]}>
        <ThemedView style={[styles.profileContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
            <FontAwesome name="user-circle-o" size={28} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.greetingText, { color: colors.text }]}>
            Hi, {username}
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.buyProButtonContainer, { shadowColor: colors.shadowColor }]}>
          <TouchableOpacity
            style={[styles.buyProButton, { backgroundColor: colors.primary, borderColor: colors.warning }]}
            onPress={() => {
              setIsPopupVisible(true);
              setOverlayVisible(!overlayVisible);
            }}
          >
            <Animated.View style={[styles.starContainer, { transform: [{ scale: scaleValue }] }]}>
              <Sparkles size={16} color={colors.warning} fill={colors.warning} style={styles.starIcon} />
            </Animated.View>
            <ThemedText style={[styles.buyProButtonText, { color: colors.warning }]}>Buy Pro</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {marketIndices.length === 0 ? (
          <ThemedText style={[{ color: colors.text }]}></ThemedText>
        ) : (
          <ScrollView
            horizontal
            style={styles.marketIndicesContainer}
            contentContainerStyle={styles.marketIndicesContent}
          >
            {marketIndices.map((index: MarketIndicesData, idx: number) => (
              <React.Fragment key={idx}>{renderMarketIndex(index)}</React.Fragment>
            ))}
          </ScrollView>
        )}

        <ThemedView style={[styles.websiteRedirectContainer, { shadowColor: colors.shadowColor }]}>
          <ThemedText style={{ fontSize: 15, color: "black" }}>Your Trusted Research Analyst</ThemedText>
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: "black" }}>
            Pay for Successful Research Calls
          </ThemedText>
          <ThemedText style={{ fontSize: 15, color: "black" }}>Start your wealth creation journey!</ThemedText>
          <ThemedView style={styles.websiteRedirectContainerBottom}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://twmresearchalert.com')}
              style={[styles.redirectionButton, { backgroundColor: colors.primary }]}
            >
              <ThemedText style={{ color: '#ffffff' }}>Know More</ThemedText>
            </TouchableOpacity>
            <Image style={styles.tradedgeLogo} source={require('@/assets/images/logo.png')} />
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.tradesContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>Our Services</ThemedText>
          <FlatList
            data={[...ourServices, { isShowMore: true }]}
            renderItem={({ item }) => {
              if (item.isShowMore) {
                return (
                  <TouchableOpacity
                    style={styles.showMoreContainer}
                    onPress={() => router.replace('/(tabs)/trades')}
                  >
                    <ThemedText style={{ color: colors.text }}>See More</ThemedText>
                    <ArrowRightIcon size={16} color={colors.warning} fill={colors.warning} />
                  </TouchableOpacity>
                );
              }
              if ('title' in item) {
                return renderOurServicesItem({ item });
              }
              return null;
            }}
            keyExtractor={(item, index) => 'title' in item ? item.title : `show-more-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
          />
        </ThemedView>

        <ThemedView style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>NSE Most Active</ThemedText>
          {NSEData.length === 0 ? (
            <ThemedText style={[{ color: colors.text, alignSelf: "center" }]}>No NSE data Available</ThemedText>
          ) : (
            <FlatList
              data={NSEData}
              renderItem={NSEBSECard}
              keyExtractor={(item) => item.ticker}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardList}
            />
          )}
        </ThemedView>

        <ThemedView style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>BSE Most Active</ThemedText>
          {BSEData.length === 0 ? (
            <ThemedText style={[{ color: colors.text, alignSelf: "center" }]}>No BSE data available</ThemedText>
          ) : (
            <FlatList
              data={BSEData}
              renderItem={NSEBSECard}
              keyExtractor={(item) => item.ticker}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardList}
            />
          )}
        </ThemedView>

        <ThemedView style={[styles.tradesContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>Best Trades</ThemedText>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              {rendertradesCard({ item: tradesCards[0] })}
              {rendertradesCard({ item: tradesCards[1] })}
            </View>
            <View style={styles.gridRow}>
              {rendertradesCard({ item: tradesCards[2] })}
              {rendertradesCard({ item: tradesCards[3] })}
            </View>
          </View>
        </ThemedView>

        <TouchableOpacity
          onPress={() => {
            getNSEBSEStocks("NSE");
            getNSEBSEStocks("BSE");
          }}
        >
          <ThemedText>Get data</ThemedText>
        </TouchableOpacity>

        <ThemedView style={[{ backgroundColor: colors.background, paddingBottom: 70 }]}></ThemedView>
      </ScrollView>

      <Modal
        visible={isPopupVisible}
        onRequestClose={() => {
          setIsPopupVisible(false);
          setOverlayVisible(!overlayVisible);
        }}
        animationType='slide'
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ height: Dimensions.get('window').height * 0.7, width: '100%' }}>
            <ThemedView style={{ flex: 1, borderRadius: 20, padding: 20 }}>
              <ThemedText>Modal</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setIsPopupVisible(false);
                  setOverlayVisible(!overlayVisible);
                }}
                style={[{ backgroundColor: colors.buttonPrimary, alignSelf: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 }]}
              >
                <ThemedText style={[{ color: "white", fontSize: 20 }]}>Close</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    zIndex: 1,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buyProButtonContainer: {
    borderRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  buyProButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    height: 30,
    gap: 6,
  },
  buyProButtonText: {
    textAlignVertical: 'top',
    fontSize: 16,
    fontWeight: '600',
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  marketIndicesContainer: {
    marginBottom: 12,
  },
  marketIndicesContent: {
    padding: 8,
    gap: 12,
    backgroundColor: "rgb(0, 37, 96)",
  },
  marketIndexItem: {
    backgroundColor: 'transparent',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '500',
  },
  websiteRedirectContainer: {
    marginHorizontal: 8,
    marginTop: 0,
    paddingVertical: 30,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "rgb(88, 233, 252)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  websiteRedirectContainerBottom: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  redirectionButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tradedgeLogo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionContainer: {
    paddingTop: 5,
    paddingHorizontal: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 8,
  },
  NSEBSECard: {
    borderWidth: 1,
    width: 200,
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    marginBottom: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  cardList: {
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'left',
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'left',
  },
  tradesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  gridContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ourServicesCardContainer: {
    width: 250,
    borderRadius: 10,
    borderLeftWidth: 5,
    marginBottom: 5,
    marginRight: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  ourServicesCard: {
    borderRadius: 10,
    padding: 15,
  },
  showMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: '100%',
    marginRight: 10,
    gap: 5,
  },
  bestTradesCardContainer: {
    flex: 1,
    borderRadius: 10,
    borderLeftWidth: 5,
    marginBottom: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  bestTradesCard: {
    borderRadius: 10,
    padding: 15,
  },
});