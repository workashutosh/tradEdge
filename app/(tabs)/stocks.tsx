import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
  Animated,
  Modal // <-- Add Modal import here
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useStockContext } from '@/context/StockContext';
import Header from '@/components/Header';
import {  useTheme } from '@/utils/theme';

const { width } = Dimensions.get('window');

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState('');
  const { NSEData, BSEData, marketIndices, updateNSEData, updateBSEData, updateMarketIndices } = useStockContext();
  
  interface StockData {
    symbol: string;
    companyName: string;
    sector: string;
    currentPrice: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    previousClose: number;
    change: number;
    changePercent: number;
    marketCap: number;
    peRatio: number;
    eps: number;
    dividend: number;
    dividendYield: number;
  }

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Animation for price pop-in (must be at top level)
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    if (stockData) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [stockData?.currentPrice]);

  // Helper to fetch live price for a given symbol
  const fetchLivePrice = async (symbol: string) => {
    try {
      const res = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/live?ticker=${symbol}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.livePrice === 'number' || typeof data.livePrice === 'string') {
          // Convert to string and trim if needed
          return `${data.livePrice}`;
        }
      }
    } catch (e) {}
    return '-';
  };

  // Fetch prices for NSE, BSE, NIFTY 50
  const [exchangePrices, setExchangePrices] = useState<{ nse: string; bse: string; nifty: string }>({ nse: '-', bse: '-', nifty: '-' });

  // Fetch exchange prices when a new stock is loaded
  React.useEffect(() => {
    if (stockData?.symbol) {
      // Remove .NS/.BO for base symbol
      let base = stockData.symbol.replace(/\.(NS|BO)$/i, '');
      fetchExchangePrices(base);
    }
  }, [stockData?.symbol]);

  const fetchExchangePrices = async (baseSymbol: string) => {
    const nseSymbol = baseSymbol.endsWith('.NS') ? baseSymbol : baseSymbol + '.NS';
    const bseSymbol = baseSymbol.endsWith('.BO') ? baseSymbol : baseSymbol + '.BO';
    // NIFTY 50 symbol (use ^NSEI)
    const niftySymbol = '^NSEI';
    setExchangePrices({ nse: '-', bse: '-', nifty: '-' });
    const [nse, bse, nifty] = await Promise.all([
      fetchLivePrice(nseSymbol),
      fetchLivePrice(bseSymbol),
      fetchLivePrice(niftySymbol)
    ]);
    setExchangePrices({ nse, bse, nifty });
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeColors = useTheme();
  const colors = {...themeColors,
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7'
  };

  // Fuzzy search helper
  function getFuzzyMatches(
    query: string,
    nseData: Array<{ ticker: string; name: string }>,
    bseData: Array<{ ticker: string; name: string }>,
    maxResults = 8
  ): Array<{ ticker: string; name: string; score: number }> {
    if (!query) return [];
    const q = query.toUpperCase();
    // Combine NSE and BSE, remove duplicates by ticker
    const allStocks = [...nseData, ...bseData].reduce((acc: Array<{ ticker: string; name: string }>, stock) => {
      if (!acc.find((s) => s.ticker === stock.ticker)) acc.push(stock);
      return acc;
    }, []);
    // Score: exact, startsWith, includes, Levenshtein distance
    function levenshtein(a: string, b: string): number {
      const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          matrix[i][j] = a[i - 1] === b[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
      }
      return matrix[a.length][b.length];
    }
    const scored = allStocks.map((stock) => {
      const ticker = (stock.ticker || '').toUpperCase();
      const name = (stock.name || '').toUpperCase();
      let score = 100;
      if (ticker === q || name === q) score = 0;
      else if (ticker.startsWith(q) || name.startsWith(q)) score = 1;
      else if (ticker.includes(q) || name.includes(q)) score = 2;
      else score = 3 + Math.min(levenshtein(ticker, q), levenshtein(name, q));
      return { ...stock, score };
    });
    return scored.sort((a, b) => a.score - b.score).slice(0, maxResults);
  }

  const searchStock = async () => {
    const clearErrorAfterDelay = (message: string) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    };

    if (!searchQuery?.trim()) {
      clearErrorAfterDelay('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setHistoricalData([]); // Clear previous historical data

    try {
      let inputSymbol = searchQuery.toUpperCase().replace(/\s+/g, '').trim();
      let symbol = inputSymbol;
      // Try to find the symbol in NSEData or BSEData
      const nseMatch = NSEData.find(stock => stock.ticker?.toUpperCase() === inputSymbol || stock.ticker?.toUpperCase() === `${inputSymbol}.NS`);
      const bseMatch = BSEData.find(stock => stock.ticker?.toUpperCase() === inputSymbol || stock.ticker?.toUpperCase() === `${inputSymbol}.BO`);
      if (nseMatch) {
        symbol = nseMatch.ticker;
      } else if (bseMatch) {
        symbol = bseMatch.ticker;
      } else if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
        // Try both NSE and BSE if not found
        let found = false;
        for (const suffix of ['.NS', '.BO']) {
          const trySymbol = symbol + suffix;
          try {
            const response = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/live?ticker=${trySymbol}`);
            if (response.ok) {
              const data = await response.json();
              if (data && (typeof data.livePrice === 'number' || typeof data.livePrice === 'string')) {
                symbol = trySymbol;
                found = true;
                break;
              }
            }
          } catch {}
        }
        if (!found) {
          // Instead of error, show suggestions
          const matches = getFuzzyMatches(searchQuery, NSEData, BSEData);
          if (matches.length > 0) {
            setSuggestions(matches);
            setShowSuggestions(true);
          } else {
            clearErrorAfterDelay('Could not fetch data for this stock. Please check the symbol or try again later.');
          }
          setLoading(false);
          return;
        }
      }

      // Check for index keywords
      const indexKeywords = ['NIFTY', 'NIFTY 50', '^NSEI', 'SENSEX', 'BANKNIFTY', 'BANK NIFTY'];
      if (indexKeywords.includes(symbol)) {
        // Fetch all indices and try to find the one matching the query
        const response = await fetch('https://harshikapatil13.pythonanywhere.com/stock/indices');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const indices = await response.json();
        // Try to match the index
        const match = indices.find((idx: any) => idx.symbol?.toUpperCase() === symbol || idx.name?.toUpperCase().includes(inputSymbol));
        if (!match) {
          clearErrorAfterDelay('Index not found. Please check the name.');
          return;
        }
        // Map to StockData
        const indexStockData = {
          symbol: match.symbol || symbol,
          companyName: match.name || symbol,
          sector: 'Index',
          currentPrice: match.price ?? 0,
          open: match.open ?? 0,
          high: match.high ?? 0,
          low: match.low ?? 0,
          volume: match.volume ?? 0,
          previousClose: match.prevClose ?? 0,
          change: match.change ?? 0,
          changePercent: match.changePercent ?? 0,
          marketCap: 0,
          peRatio: 0,
          eps: 0,
          dividend: 0,
          dividendYield: 0,
        };
        setStockData(indexStockData);
        setHistoricalData([]); // No historical for index
      } else {
        // For stocks, use the live endpoint
        const response = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/live?ticker=${symbol}`);
        if (!response.ok) {
          if (response.status === 404) {
            clearErrorAfterDelay('Stock not found. Please check the symbol.');
            return;
          }
          if (response.status === 504) {
            clearErrorAfterDelay('The server took too long to respond. Please try again later.');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Map API response to StockData
        const stockDataObj = {
          symbol: symbol,
          companyName: data.name || symbol,
          sector: '',  // API doesn't provide sector info
          currentPrice: data.livePrice ?? 0,
          open: data.livePrice ?? 0,  // API doesn't provide open price
          high: data.livePrice ?? 0,  // API doesn't provide high
          low: data.livePrice ?? 0,   // API doesn't provide low
          volume: 0,                  // API doesn't provide volume
          previousClose: data.livePrice ?? 0, // API doesn't provide previous close
          change: 0,                  // API doesn't provide change
          changePercent: 0,           // API doesn't provide change percent
          marketCap: 0,               // API doesn't provide market cap
          peRatio: 0,                 // API doesn't provide PE ratio
          eps: 0,                     // API doesn't provide EPS
          dividend: 0,                // API doesn't provide dividend
          dividendYield: 0,           // API doesn't provide dividend yield
        };
        setStockData(stockDataObj);
        // Fetch historical data
        try {
          const histRes = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/historical?ticker=${symbol}`);
          if (histRes.ok) {
            const histData = await histRes.json();
            if (Array.isArray(histData)) {
              setHistoricalData(histData);
            } else {
              setHistoricalData([]);
            }
          } else {
            setHistoricalData([]);
          }
        } catch (e) {
          setHistoricalData([]);
        }
      }
    } catch (err) {
      console.error('Stock search error:', err);
      if (err instanceof Error) {
        clearErrorAfterDelay(err.message || 'Failed to fetch stock data');
      } else {
        clearErrorAfterDelay('Failed to fetch stock data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format number with commas (e.g., 1410.23 -> 1,410.23)
  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null || isNaN(Number(num))) return '-';
    return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderCurrentPrice = () => {
    if (!stockData) return null;
    const isUp = (stockData.change ?? 0) >= 0;
    return (
      <LinearGradient
        colors={colors.isDarkMode ? [colors.gradientStart, colors.gradientEnd] : ['#fff', '#fff']}
        style={[styles.card, { backgroundColor: colors.isDarkMode ? colors.card : '#fff', padding: 0, overflow: 'hidden' }]}
      >
        <View style={{ padding: 20 }}>
          {stockData?.companyName && (
            <ThemedText type="title" style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>
              {stockData.companyName}
            </ThemedText>
          )}
          <ThemedText type="title" style={[styles.cardTitle, { color: colors.text, marginBottom: 10 }]}>Current Price</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 25, color: colors.primary, fontWeight: 'bold', letterSpacing: 1, textShadowColor: colors.primary + '55', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>
                ₹{formatNumber(stockData.currentPrice)}
              </ThemedText>
              {/* Add more space below the price */}
              <View style={{ height: 10 }} />
            </Animated.View>
            <View style={{
              backgroundColor: isUp ? colors.success + '22' : colors.error + '22',
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 16,
              alignItems: 'center',
              marginLeft: 12,
            }}>
              <Text style={{ color: isUp ? colors.success : colors.error, fontWeight: 'bold', fontSize: 20 }}>
                {isUp ? '▲' : '▼'}
              </Text>
            </View>
          </View>
          {/* Add more space between price section and the open/high/low/volume row */}
          <View style={{ height: 8 }} />
          {/* 2x2 grid for Open, High, Low, Volume */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <View style={[styles.metricBox, { backgroundColor: colors.primary + '15' }]}> 
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: 'bold' }}>Open</Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>₹{formatNumber(stockData.open)}</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.success + '15' }]}> 
              <Text style={{ color: colors.success, fontSize: 13, fontWeight: 'bold' }}>High</Text>
              <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 16 }}>₹{formatNumber(stockData.high)}</Text>
            </View>
          </View>
          <View style={{ height: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <View style={[styles.metricBox, { backgroundColor: colors.error + '15' }]}> 
              <Text style={{ color: colors.error, fontSize: 13, fontWeight: 'bold' }}>Low</Text>
              <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>₹{formatNumber(stockData.low)}</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: colors.text + '15' }]}> 
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>Volume</Text>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{formatNumber(stockData.volume)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  // Horizontal Exchange Section
  const renderExchangesData = () => {
    // Helper to render each exchange box with loading spinner if price is '-'
    const renderExchangeBox = (label: string, price: string, color: string, bgColor: string) => (
      <View style={[
        styles.exchangeBox,
        {
          backgroundColor: bgColor,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          shadowColor: colors.isDarkMode ? '#000' : '#b3b3b3', // moved here for dynamic theming
        },
      ]}>
        <Text style={{ color, fontWeight: 'bold', fontSize: 18, width: 90 }}>{label}</Text>
        {price === '-' ? (
          <ActivityIndicator size="small" color={color} style={{ marginLeft: 12 }} />
        ) : (
          <Text style={{ color: colors.text, fontSize: 20, marginLeft: 12, fontWeight: 'bold' }}>{`₹${formatNumber(price)}`}</Text>
        )}
      </View>
    );
    return (
      <LinearGradient
        colors={colors.isDarkMode ? [colors.gradientStart, colors.gradientEnd] : ['#fff', '#fff']}
        style={[styles.card, { backgroundColor: colors.isDarkMode ? colors.card : '#fff', padding: 0, overflow: 'hidden' }]}
      >
        <View style={{ padding: 20, paddingBottom: 10 }}>
          <ThemedText type="title" style={[styles.cardTitle, { color: colors.text, marginBottom: 8 }]}>Exchanges</ThemedText>
          <View style={{ gap: 0 }}>
            {renderExchangeBox('NSE', exchangePrices.nse, colors.success, colors.success + '23')}
            {renderExchangeBox('BSE', exchangePrices.bse, colors.warning, colors.warning + '22')}
            {renderExchangeBox('NIFTY 50', exchangePrices.nifty, colors.primary, colors.primary + '22')}
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderHistoricalData = () => {
    if (!historicalData || historicalData.length === 0) return null;
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <ThemedText type="title" style={[styles.cardTitle, { color: colors.text }]}>Historical Data (Last 7 Days)</ThemedText>
        <View style={[styles.historicalTable, { borderColor: colors.border, backgroundColor: colors.background }]}> 
          <View style={[styles.historicalRow, styles.historicalHeader, { borderBottomColor: colors.border }]}> 
            <Text style={[styles.historicalCell, styles.historicalHeaderText, { color: colors.text }]}>Date</Text>
            <Text style={[styles.historicalCell, styles.historicalHeaderText, { color: colors.text }]}>Open</Text>
            <Text style={[styles.historicalCell, styles.historicalHeaderText, { color: colors.text }]}>High</Text>
            <Text style={[styles.historicalCell, styles.historicalHeaderText, { color: colors.text }]}>Low</Text>
            <Text style={[styles.historicalCell, styles.historicalHeaderText, { color: colors.text }]}>Close</Text>
            <Text style={[styles.historicalCell, styles.historicalHeaderText, { color: colors.text }]}>Volume</Text>
          </View>
          {historicalData.slice(-7).map((item, idx) => (
            <View key={idx} style={[styles.historicalRow, { borderBottomColor: colors.border }]}> 
              <Text style={[styles.historicalCell, { color: colors.text }]}>{item.date || '-'}</Text>
              <Text style={[styles.historicalCell, { color: colors.text }]}>₹{formatNumber(item.open)}</Text>
              <Text style={[styles.historicalCell, { color: colors.text }]}>₹{formatNumber(item.high)}</Text>
              <Text style={[styles.historicalCell, { color: colors.text }]}>₹{formatNumber(item.low)}</Text>
              <Text style={[styles.historicalCell, { color: colors.primary, fontWeight: 'bold' }]}>₹{formatNumber(item.close)}</Text>
              <Text style={[styles.historicalCell, { color: colors.text }]}>{formatNumber(item.volume)}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    );
  };

  // Suggestion Modal
  const renderSuggestionModal = () => (
    <Modal
      visible={showSuggestions}
      animationType="slide"
      transparent
      onRequestClose={() => setShowSuggestions(false)}
    >
      <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, width: '90%', maxHeight: '70%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: colors.text }}>Did you mean:</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={item.ticker + idx}
                style={{ paddingVertical: 12, borderBottomWidth: idx < suggestions.length - 1 ? 1 : 0, borderBottomColor: colors.border }}
                onPress={async () => {
                  setShowSuggestions(false);
                  setSearchQuery(item.ticker);
                  setTimeout(() => searchStock(), 100); // Delay to allow modal to close
                }}
              >
                <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold' }}>{item.ticker}</Text>
                <Text style={{ fontSize: 14, color: colors.text }}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={{ marginTop: 16, alignSelf: 'flex-end' }}
            onPress={() => setShowSuggestions(false)}
          >
            <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    return (
      <>
        <View style={[styles.searchContainer, { 
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 8,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }]}>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 16,
              fontSize: 16,
              height: 50,
              flex: 1,
              marginRight: 10,
            }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Enter stock symbol (e.g., AAPL)"
            placeholderTextColor={isDark ? '#808080' : '#666666'}
            onSubmitEditing={searchStock}
          />
          <TouchableOpacity 
            style={[styles.searchButton, { 
              backgroundColor: colors.primary,
              width: 50,
              height: 50,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }]}
            onPress={searchStock}
            activeOpacity={0.7}
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
          <View style={[styles.errorContainer, { 
            backgroundColor: colors.error,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            shadowColor: colors.error,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }]}>
            <MaterialIcons name="error" size={24} color="#ffffff" />
            <Text style={[styles.errorText, { 
              color: '#ffffff',
              marginLeft: 8,
              fontSize: 16,
              flex: 1,
            }]}>{error}</Text>
          </View>
        )}

        {stockData && (
          <>
            {/* {renderStockOverview()} -- Company Overview removed */}
            {renderCurrentPrice()}
            {renderExchangesData()}
            {renderHistoricalData()}
          </>
        )}

        {renderSuggestionModal()}
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Floating ticker message */}
      {/* Remove floating ticker, show stock name in current price container instead */}
      <Header title={"Stocks"} showBuyProButton={true}/>
      <FlatList
        data={[1]} // Single item since we're using it as a container
        renderItem={() => renderContent()}
        keyExtractor={() => 'stock-content'}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
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
  value: {
    flex: 2,
    textAlign: 'right',
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
  },
  maPrice: {
    fontSize: 16,
    marginBottom: 4,
  },
  exchangeBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  historicalTable: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 18,
    marginBottom: 24,
    overflow: 'hidden',
  },
  historicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  historicalHeader: {
    backgroundColor: '#f0f0f0',
  },
  historicalCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    paddingHorizontal: 2,
  },
  historicalHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  metricBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    minWidth: 0
  },
});