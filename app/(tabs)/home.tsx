import { Image, StyleSheet, Animated, Platform, TouchableOpacity, useColorScheme, SafeAreaView, View, FlatList, ScrollView, Linking, Touchable, Dimensions } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightIcon, Sparkles } from 'lucide-react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStockContext } from '@/context/StockContext';
import { Modal } from 'react-native';

export default function HomeScreen() {
  const [username, setUsername] = useState('User');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  
  // const [NSEData, setNSEData] = useState<StockData[]>([]);
  // const [BSEData, setBSEData] = useState<StockData[]>([]);
  // const [marketIndices, setMarketIndices] = useState<MarketIndicesData[]>([]);
  const { NSEData, BSEData, marketIndices, updateNSEData, updateBSEData, updateMarketIndices } = useStockContext();
  const stocks=["nifty 200", "nifty 50", "nifty auto", "nifty bank", "sensex", "nifty infra", "nifty it", "nifty metal", "nifty pharma", "nifty psu bank"]

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
    shadowColor: isDark ?"rgb(128, 128, 128)" :"rgb(0, 0, 0)",
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
    desc: string;
    traders: string;
    tags: string[];
    credits: string;
    minInvestment: string;
    icon: string;
    categoryTag: string;
    additionalInfo: string[];
    color: string;
  }

  interface ServiceItem {
    isShowMore?: boolean;
    title: string;
    desc: string;
    traders: string;
    tags: string[];
    credits: string;
    minInvestment: string;
    icon: string;
    categoryTag: string;
    category: string;
    additionalInfo: string[];
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

      // Loop through each stock symbol
      for (const st of stocks) {
        const response = await fetch(
          `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${st}`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': 'bc620173a1msh189575d170e4385p16222fjsnfad95363999a',
              'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com',
            },
          }
        );

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error(`Stock not found: ${st}`);
          continue; // Skip to next stock if current one has error
        }

        // Create object matching the interface
        const stockData: MarketIndicesData = {
          ticker: st.toUpperCase(),
          percentChange: data.percentChange
        };

        results.push(stockData);
      }

      // Update state with all collected data
      updateMarketIndices(results);

    } catch (error) {
      console.error('Error fetching market indices:', error);
      // setError(error.message || 'An error occurred while fetching data');
    }
  };

  const getNSEBSEStocks = async (stock: string) => {
    // setLoading(true);
    try {
      const response = await fetch(
        `https://indian-stock-exchange-api2.p.rapidapi.com/${stock}_most_active`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'bc620173a1msh189575d170e4385p16222fjsnfad95363999a',
            'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com',
          },
        }
      );

      const data = await response.json();
      if (data.error) {
        // setError('Error fetching most active stocks');
        console.error('Error fetching most active stocks');
      } else {
        // Map API data to ticker format

        const formattedData: StockData[] = data.map((stock: any) => ({
          ticker: stock.ticker, // Adjust based on API response
          price: stock.price,
          netChange: stock.net_change,
          percentChange: stock.percent_change,
          high: stock.high,
          low: stock.low,
        }));
        if(stock==="NSE")updateNSEData(formattedData);
        if(stock==="BSE")updateBSEData(formattedData);
      }
    } catch (err) {
      // setError('Failed to fetch stock data');
      console.error(`Failed to fetch ${stock} data`);
      // console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  const ourServices: ServiceItem[] = [
    {
      title: 'Cash Intraday',
      desc: 'Intraday calls for cash market with daily recommendations.',
      traders: '1-2 calls/day',
      tags: ['Moderate Risk', 'Avg ₹2,384/trade'],
      credits: '₹9,500 / 45 Credits',
      minInvestment: '₹25,000',
      icon: 'trending-up',
      categoryTag: 'Equity',
      category: 'Intraday Packages',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.primary,
    },
    {
      title: 'Index Futures',
      desc: 'NIFTY & BANKNIFTY futures with precise entries.',
      traders: '1-2 calls/day',
      tags: ['Moderate Risk', 'Avg ₹4,299/trade'],
      credits: '₹9,000 / 45 Credits',
      minInvestment: '₹50,000',
      icon: 'bar-chart',
      categoryTag: 'Index Future',
      category: 'Intraday Packages',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.warning,
    },
    {
      title: 'Stock Options',
      desc: 'High-accuracy options trading calls.',
      traders: '1-2 calls/day',
      tags: ['High Risk', 'Avg ₹3,524/trade'],
      credits: '₹9,500 / 45 Credits',
      minInvestment: '₹25,000',
      icon: 'tune', // Replaced "options" with "tune"
      categoryTag: 'Stock Option',
      category: 'Options Packages',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.buttonPrimary,
    },
    {
      title: 'Index Options',
      desc: 'Strategic trading for index options.',
      traders: '1-2 calls/day',
      tags: ['Moderate Risk', 'Avg ₹3,126/trade'],
      credits: '₹9,000 / 45 Credits',
      minInvestment: '₹25,000',
      icon: 'tune', // Replaced "options" with "tune"
      categoryTag: 'Index Option',
      category: 'Options Packages',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.error
    },
  ]

  const tradesCards = [
    {
      id: '1',
      title: 'Cash Intraday',
      desc: 'Intraday calls for cash market with daily recommendations.',
      traders: '1-2 calls/day',
      tags: ['Moderate Risk', 'Avg ₹2,384/trade'],
      credits: '₹9,500 / 45 Credits',
      minInvestment: '₹25,000',
      icon: 'trending-up',
      categoryTag: 'Equity',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.primary,
    },
    {
      id: '2',
      title: 'Index Futures',
      desc: 'NIFTY & BANKNIFTY futures with precise entries.',
      traders: '1-2 calls/day',
      tags: ['Moderate Risk', 'Avg ₹4,299/trade'],
      credits: '₹9,000 / 45 Credits',
      minInvestment: '₹50,000',
      icon: 'bar-chart',
      categoryTag: 'Index Future',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.success,
    },
    {
      id: '3',
      title: 'Index Options',
      desc: 'Strategic trading for index options.',
      traders: '1-2 calls/day',
      tags: ['Moderate Risk', 'Avg ₹3,126/trade'],
      credits: '₹9,000 / 45 Credits',
      minInvestment: '₹25,000',
      icon: 'tune', // Replaced "options" with "tune"
      categoryTag: 'Index Option',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.warning,
    },
    {
      id: '4',
      title: 'Stock Options',
      desc: 'High-accuracy options trading calls.',
      traders: '1-2 calls/day',
      tags: ['High Risk', 'Avg ₹3,524/trade'],
      credits: '₹9,500 / 45 Credits',
      minInvestment: '₹25,000',
      icon: 'tune', // Replaced "options" with "tune"
      categoryTag: 'Stock Option',
      additionalInfo: [
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      color: colors.error,
    },
  ];

  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Trigger the scale animation in a loop
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
      ]).start(() => pulse()); // Restart the animation when it ends
    };

    pulse(); // Start the animation

    // Cleanup function (optional)
    return () => scaleValue.stopAnimation();
  }, [scaleValue]);  


  const handleTradePress = (item: TradeCards, category: string) => {
      router.push({
        pathname: '/main/TradeDetails',
        params: {
          title: item.title,
          desc: item.desc,
          traders: item.traders,
          tags: JSON.stringify(item.tags),
          credits: item.credits,
          minInvestment: item.minInvestment,
          icon: item.icon,
          category: category,
          additionalInfo: JSON.stringify(item.additionalInfo),
        },
      });
    };

  const renderMarketIndex = ({ ticker, percentChange }: MarketIndicesData) => {
      const isNegative = percentChange < 0;
      return (
        <ThemedView style={[styles.marketIndexItem, {}]}>
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
    <ThemedView style={[styles.ourServicesCardContainer, { borderLeftColor: item.color, shadowColor: colors.shadowColor}]}>
      <TouchableOpacity onPress={() => handleTradePress(item, item.category)}>
        <View style={[styles.ourServicesCard, { backgroundColor: colors.card,}]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
          <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>
            {item.desc}
          </ThemedText>
          <ThemedText style={[styles.cardDescription, { color: colors.text, fontWeight: "600" }]}>
            Min Investment: {item.minInvestment}
          </ThemedText>
          <ThemedText style={[styles.cardDescription, { color: colors.text, fontWeight: "600" }]}>
            Traders: {item.traders}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );

  const rendertradesCard = ({ item }: { item: TradeCards }) => (
    <ThemedView style={[styles.bestTradesCardContainer, { borderLeftColor: item.color, shadowColor: colors.shadowColor}]}>
      <TouchableOpacity onPress={() => handleTradePress(item,"Top Trade")}>
        <View style={[styles.bestTradesCard, { backgroundColor: colors.card,}]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
          <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>
            {item.desc}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );

  const NSEBSECard = ({ item }: { item: { ticker: string; price: number; netChange: number; percentChange: number; high: number; low: number; } }) => {
    const isGain = item.netChange > 0;
    
    return (
      <ThemedView style={[styles.NSEBSECard, {borderColor: isGain?"green":"red" , backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
        <ThemedText style={[styles.cardTitle, { 
          color: isGain?'green':'red', // Green for gain, default color otherwise
          fontSize: 15 
        }]}>
          {item.ticker}
          {isGain && '  ▲'}  {/* Up triangle for gain */}
          {!isGain && '▼'} {/* Down triangle for loss */}
          {item.percentChange}%
        </ThemedText>
        <ThemedView style={[{backgroundColor: 'transparent'}]}>
          <ThemedText style={[styles.cardDescription, { 
            color: isDark ? '#bbbbbb' : '#666' 
          }]}>
            {item.price}
          </ThemedText>
          <ThemedText style={[styles.cardDescription, { 
            color: isDark ? '#bbbbbb' : '#666' 
          }]}>
            H: {item.high} L: {item.low}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {overlayVisible && (
        <View style={[styles.overlay, {zIndex: overlayVisible?10:-1}]}>
          <View style={[{}]}>
          </View>
        </View>
      )}
      {/* Fixed Header */}

      <View style={[styles.header]}>
        <ThemedView style={[styles.profileContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
            <FontAwesome name="user-circle-o" size={28} color={colors.text} />
          </TouchableOpacity>
          
          <ThemedText style={[styles.greetingText, { color: colors.text }]}>
            Hi, {username}
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.buyProButtonContainer, {shadowColor: colors.shadowColor}]}>
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
            <ThemedText style={[styles.buyProButtonText, {color: colors.warning}]}>Buy Pro</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Market Indices Horizontal Scroll */}
        {
          (marketIndices.length===0)?(
            <ThemedText style={[{color: colors.text}]}>
              
            </ThemedText>
          ):(
            <ScrollView 
              horizontal 
              // showsHorizontalScrollIndicator={false}
              style={styles.marketIndicesContainer}
              contentContainerStyle={styles.marketIndicesContent}
            >
              {marketIndices.map((index: MarketIndicesData, idx: number) => (
              <React.Fragment key={idx}>
                {renderMarketIndex(index)}
              </React.Fragment>
              ))}
            </ScrollView>
          )
        }

        {/* Website redirect section */}
          <ThemedView style={[styles.websiteRedirectContainer, {shadowColor: colors.shadowColor}]}>
            <ThemedText style={{ fontSize: 15, color: "black" }}>
              Your Trusted Research Analyst
            </ThemedText>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: "black" }}>
              Pay for Successful Research Calls
            </ThemedText>
            <ThemedText style={{ fontSize: 15, color: "black" }}>
              Start your wealth creation journey!
            </ThemedText>
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
        
        {/* Our services Section */}
        <ThemedView style={[styles.tradesContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
            Our Services
          </ThemedText>
          <FlatList
            data={[...ourServices, { isShowMore: true }]} // Add a show more item
            renderItem={({ item }) => {
              if (item.isShowMore) {
                return (
                  <TouchableOpacity 
                    style={styles.showMoreContainer}
                    onPress={() => router.replace('/(tabs)/trades')}
                  >
                    <ThemedText style={{ color: colors.text }}>
                      See More
                    </ThemedText>
                    <ArrowRightIcon size={16} color={colors.warning} fill={colors.warning} />
                  </TouchableOpacity>
                );
              }
              if ('title' in item) {
                return renderOurServicesItem({ item });
              }
              return null;
            }}
            // keyExtractor={(item) => item.title || `show-more-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
          />
        </ThemedView>

        {/* NSE cards Section */}
        <ThemedView style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
            NSE Most Active
          </ThemedText>
          {
            (NSEData.length===0)?(
              <ThemedText style={[{color: colors.text, alignSelf: "center"}]}>
                No NSE data Available
              </ThemedText>
            ):(
              <FlatList
                data={NSEData}
                renderItem={NSEBSECard}
                keyExtractor={(item) => item.ticker}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardList}
              />
            )
          }
        </ThemedView>

        {/* BSE cards Section */}
        <ThemedView style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
            BSE Most Active
          </ThemedText>
          {
            (BSEData.length === 0)?(
              <ThemedText style={[{ color: colors.text, alignSelf: "center" }]}>
                No BSE data available
              </ThemedText>
            ):(
              <FlatList
                data={BSEData}
                renderItem={NSEBSECard}
                keyExtractor={(item) => item.ticker}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardList}
              />
            )
          }
        </ThemedView>

         {/* Top Trades Section (2x2 Grid) */}
         <ThemedView style={[styles.tradesContainer, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
            Best Trades
          </ThemedText>
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
        onPress={()=>{
          getNSEBSEStocks("NSE");
          getNSEBSEStocks("BSE");
          // getMarketIndices();
        }}><ThemedText>Get data</ThemedText></TouchableOpacity>

        <ThemedView style={[{backgroundColor: colors.background, paddingBottom: 70}]}>

        </ThemedView>
      </ScrollView>

      {/* Buy Pro Popup */}
      <Modal
        visible={isPopupVisible}
        onRequestClose={() => {
          setIsPopupVisible(false);
          setOverlayVisible(!overlayVisible);
        }}
        animationType='slide'
        transparent={true}  // Important: allows the background to show through
      >
        <View
          style={{
            flex: 1,
            // backgroundColor: "rgba(0, 0, 0, 0.43)",
            justifyContent: 'flex-end',  // Aligns content to bottom
          }}
          >
          <View
            style={{
              height: Dimensions.get('window').height * 0.7,  // 70% height
              width: '100%',
            }}
          >
            <ThemedView style={{ flex: 1, borderRadius: 20, padding: 20 }}>
              <ThemedText>Modal</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setIsPopupVisible(false);
                  setOverlayVisible(!overlayVisible);
                }}
                style={[{backgroundColor: colors.buttonPrimary, alignSelf: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5,}]}
              >
                <ThemedText style={[{color: "white", fontSize: 20,}]}>Close</ThemedText>
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
  backgroundLight: {
    backgroundColor: '#f5f7fa',
  },
  backgroundDark: {
    backgroundColor: '#121212',
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
    // paddingVertical: 4,
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
  // Market Indices Styles
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
  // Website Redirect Styles
  websiteRedirectContainer: {
    marginHorizontal: 8,
    marginTop: 0,
    paddingVertical: 30,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "rgb(88, 233, 252)",
    // backgroundColor: 'white',
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
  // Why Choose Section
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
  card: {
    width: 250,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 6,
    marginBottom: 5,
    borderLeftWidth: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  cardImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
    alignSelf: 'center',
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
  // Trades Section (2x2 Grid)
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
    width: 250, // Fixed width for all cards
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
    width: 100, // Fixed width for show more button
    height: '100%', // Match card height
    marginRight: 10,
    // backgroundColor: 'red',
    gap: 5,
  },
  bestTradesCardContainer:{
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
    // borderLeftWidth: 5,
  },
  exploreButton: {
    marginTop: 2,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});