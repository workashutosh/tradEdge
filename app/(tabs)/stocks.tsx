import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStockContext } from '@/context/StockContext';
import Header from '@/components/Header';

const { width } = Dimensions.get('window');

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState('');
  // get data from stock context
  const { NSEData, BSEData, marketIndices, updateNSEData, updateBSEData, updateMarketIndices } = useStockContext();
  
  interface StockData {
    companyName: string;
    industry: string;
    currentPrice: {
      BSE: number;
      NSE: number;
    };
    yearHigh: number;
    yearLow: number;
    percentChange: number;
    stockTechnicalData: {
      days: number;
      bsePrice: string;
      nsePrice: string;
    }[];
  }

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    error: '#ff4444',
    primary: '#6200ee',
    success: '#00c853',
    warning: '#ffab00',
    shadowColor: isDark ?"rgb(128, 128, 128)" :"rgb(0, 0, 0)",
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7'
  };

  const searchStock = async () => {
    const clearErrorAfterDelay = (message: string) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    };

    if (!searchQuery?.trim()) {
      clearErrorAfterDelay('Please enter a stock name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${searchQuery.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
            'x-rapidapi-host': process.env.EXPO_PUBLIC_RAPID_API_HOST || '',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API quota exceeded. Please try again later.');
        }
        throw new Error('Stock not found');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error('Stock not found');
      }

      // update stock data globally
      setStockData(data);

    } catch (err) {
      if (err instanceof Error) {
        clearErrorAfterDelay(err.message || 'Failed to fetch stock data');
      } else {
        clearErrorAfterDelay('Failed to fetch stock data');
      }
    } finally {
      setLoading(false);
    }
  };


  const NSEBSECard = ({ item }: { item: { ticker: string; price: number; netChange: number; percentChange: number; high: number; low: number; } }) => {
    const isGain = item.netChange > 0;
      return (
        <ThemedView style={[styles.NSEBSECard, { borderColor: isGain ? "green" : "red", backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
          <ThemedText style={[styles.cardTitle, { color: isGain ? 'green' : 'red', fontSize: 15 }]}>
            {item.ticker} {isGain ? '▲' : '▼'} {item.percentChange}%
          </ThemedText>
          <ThemedView style={[{ backgroundColor: 'transparent' }]}>
            <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666', fontWeight: '600' }]}>{item.price}</ThemedText>
            <ThemedView style={[{backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between'}]}>
              <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>High: {item.high}</ThemedText>
              <ThemedText style={[styles.cardDescription, { color: isDark ? '#bbbbbb' : '#666' }]}>Low: {item.low}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      );
    };

  const renderStockOverview = () => {
    if (!stockData) return null;
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Company Overview</Text>
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={20} color={colors.text} />
          <Text style={[styles.value, { color: colors.text, marginLeft: 8 }]}>{stockData.companyName}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={20} color={colors.text} />
          <Text style={[styles.value, { color: colors.text, marginLeft: 8 }]}>{stockData.industry}</Text>
        </View>
      </LinearGradient>
    );
  };

  const renderCurrentPrice = () => {
    if (!stockData?.currentPrice) return null;
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Current Price</Text>
        <View style={styles.priceContainer}>
          <View style={styles.exchangePrice}>
            <Text style={[styles.exchangeLabel, { color: colors.text }]}>BSE</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>₹{stockData.currentPrice.BSE}</Text>
          </View>
          <View style={styles.exchangePrice}>
            <Text style={[styles.exchangeLabel, { color: colors.text }]}>NSE</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>₹{stockData.currentPrice.NSE}</Text>
          </View>
        </View>
        <View style={styles.priceMetrics}>
          <Text style={[styles.metric, { color: colors.text }]}>
            52W High: ₹{stockData.yearHigh}
          </Text>
          <Text style={[styles.metric, { color: colors.text }]}>
            52W Low: ₹{stockData.yearLow}
          </Text>
          <Text style={[styles.metric, { color: stockData.percentChange > 0 ? colors.success : colors.error }]}>
            Change: {stockData.percentChange}%
          </Text>
        </View>
      </LinearGradient>
    );
  };

  const renderTechnicalData = () => {
    if (!stockData?.stockTechnicalData) return null;
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Moving Averages</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stockData.stockTechnicalData.map((data, index) => (
            <View key={index} style={styles.technicalCard}>
              <Text style={[styles.daysText, { color: colors.text }]}>{data.days} Days</Text>
              <Text style={[styles.maPrice, { color: colors.text }]}>
                BSE: ₹{parseFloat(data.bsePrice).toFixed(2)}
              </Text>
              <Text style={[styles.maPrice, { color: colors.text }]}>
                NSE: ₹{parseFloat(data.nsePrice).toFixed(2)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <View style={[styles.header]}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Stock Search</Text>
      </View> */}
      <Header title={"Stocks"} showBuyProButton={true}/>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.card 
            }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Enter stock name (e.g., Tata Steel)"
            placeholderTextColor={isDark ? '#808080' : '#666666'}
            onSubmitEditing={searchStock}
          />
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={searchStock}
          >
            <MaterialIcons name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error }]}>
            <MaterialIcons name="error" size={24} color="#ffffff" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {stockData && (
          <>
            {renderStockOverview()}
            {renderCurrentPrice()}
            {renderTechnicalData()}
          </>
        )}

        {/* NSE cards Section */}
        {/* <ThemedView style={[styles.sectionContainer, { backgroundColor: colors.background, paddingHorizontal: 0 }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
            NSE Most Active
          </ThemedText>
          {
            (NSEData.length === 0) ? (
              <ThemedText style={[{ color: colors.text, alignSelf: "center" }]}>
                No NSE data Available
              </ThemedText>
            ) : (
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
        </ThemedView> */}

        {/* BSE cards Section */}
        {/* <ThemedView style={[styles.sectionContainer, { backgroundColor: colors.background, paddingHorizontal: 0 }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
            BSE Most Active
          </ThemedText>
          {
            (BSEData.length === 0) ? (
              <ThemedText style={[{ color: colors.text, alignSelf: "center" }]}>
                No BSE data available
              </ThemedText>
            ) : (
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
        </ThemedView> */}
      </ScrollView>
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
    padding: 4,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  descriptionRow: {
    paddingVertical: 8,
  },
  label: {
    fontWeight: '500',
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
    fontSize: 16,
  },
  description: {
    marginTop: 4,
    lineHeight: 20,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  exchangePrice: {
    alignItems: 'center',
  },
  exchangeLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  priceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metric: {
    fontSize: 16,
    marginTop: 8,
  },
  technicalCard: {
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 140,
  },
  daysText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  maPrice: {
    fontSize: 16,
    marginBottom: 4,
  },
  sectionContainer: {
    paddingTop: 5,
    paddingHorizontal: 8,

  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 12,
  },
  NSEBSECard: {
    borderWidth: 1,
    width: 200,
    borderRadius: 5,
    padding: 15,
    marginRight: 10,
    marginBottom: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'left',
  },
  cardList: {
    paddingBottom: 10,
  },
});