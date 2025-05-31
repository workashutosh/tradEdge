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
import {  useTheme } from '@/utils/theme';

const { width } = Dimensions.get('window');

// Your Alpha Vantage API key
const ALPHA_VANTAGE_API_KEY = 'RTT9DS9ZHE6BO715'; // Replace with your actual API key

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

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeColors = useTheme();
  const colors = {...themeColors,
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7'
  };

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

    try {
      // Format the symbol for Indian stocks
      let symbol = searchQuery.toUpperCase().trim();
      
      // If the symbol doesn't end with .NS or .BO, add .NS by default
      if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
        symbol = `${symbol}.NS`;
      }

      // First try to get the quote
      const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      console.log('Fetching quote from URL:', quoteUrl);
      
      const quoteResponse = await fetch(quoteUrl, {
        method: 'GET',
      });

      if (!quoteResponse.ok) {
        throw new Error(`HTTP error! status: ${quoteResponse.status}`);
      }

      const quoteData = await quoteResponse.json();
      console.log('Quote API Response:', JSON.stringify(quoteData, null, 2));

      // Check for API limit messages
      if (quoteData.Note) {
        console.log('API Note:', quoteData.Note);
        throw new Error(quoteData.Note);
      }

      // Check for error messages
      if (quoteData.Error) {
        console.log('API Error:', quoteData.Error);
        throw new Error(quoteData.Error);
      }

      // Check for invalid API key
      if (quoteData['Error Message'] && quoteData['Error Message'].includes('Invalid API call')) {
        console.log('Invalid API Key Error:', quoteData['Error Message']);
        throw new Error('Invalid API key. Please check your Alpha Vantage API key.');
      }

      // Check for empty response
      if (Object.keys(quoteData).length === 0) {
        console.log('Empty Quote Response');
        throw new Error('Empty response from API. Please try again.');
      }

      // Check for Information message
      if (quoteData.Information) {
        console.log('API Information:', quoteData.Information);
        throw new Error(`Invalid symbol format. Please try with market suffix (e.g., ${symbol.replace('.NS', '')}.NS for NSE or ${symbol.replace('.NS', '')}.BO for BSE)`);
      }

      const quote = quoteData['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data available for ${symbol}. Please verify the symbol is correct.`);
      }

      // Now get the time series data
      const timeSeriesUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      console.log('Fetching time series from URL:', timeSeriesUrl);
      
      const timeSeriesResponse = await fetch(timeSeriesUrl, {
        method: 'GET',
      });

      if (!timeSeriesResponse.ok) {
        throw new Error(`HTTP error! status: ${timeSeriesResponse.status}`);
      }

      const timeSeriesData = await timeSeriesResponse.json();
      console.log('Time Series API Response:', JSON.stringify(timeSeriesData, null, 2));

      const dailyData = timeSeriesData['Time Series (Daily)'];
      if (!dailyData) {
        // If we don't have time series data, we can still show the current quote
        const currentPrice = parseFloat(quote['05. price']);
        const previousClose = parseFloat(quote['08. previous close']);
        const change = currentPrice - previousClose;
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

        const stockData: StockData = {
          symbol: symbol,
          companyName: symbol,
          sector: 'N/A',
          currentPrice: currentPrice,
          open: parseFloat(quote['02. open']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          volume: parseInt(quote['06. volume']),
          previousClose: previousClose,
          change: change,
          changePercent: changePercent,
          marketCap: 0,
          peRatio: 0,
          eps: 0,
          dividend: 0,
          dividendYield: 0
        };

        console.log('Processed Stock Data from Quote:', stockData);
        setStockData(stockData);
        return;
      }

      const dates = Object.keys(dailyData).sort().reverse();
      if (dates.length < 2) {
        throw new Error('Insufficient historical data available');
      }

      const latestDate = dates[0];
      const previousDate = dates[1];
      
      const latestData = dailyData[latestDate];
      const previousData = dailyData[previousDate];

      if (!latestData || !previousData) {
        throw new Error('Insufficient data available');
      }

      const currentPrice = parseFloat(latestData['4. close']);
      const previousClose = parseFloat(previousData['4. close']);
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      const stockData: StockData = {
        symbol: symbol,
        companyName: symbol,
        sector: 'N/A',
        currentPrice: currentPrice,
        open: parseFloat(latestData['1. open']),
        high: parseFloat(latestData['2. high']),
        low: parseFloat(latestData['3. low']),
        volume: parseInt(latestData['5. volume']),
        previousClose: previousClose,
        change: change,
        changePercent: changePercent,
        marketCap: 0,
        peRatio: 0,
        eps: 0,
        dividend: 0,
        dividendYield: 0
      };

      console.log('Processed Stock Data from Time Series:', stockData);
      setStockData(stockData);

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

  const renderStockOverview = () => {
    if (!stockData) return null;
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <ThemedText type="title" style={[styles.cardTitle, { color: colors.text }]}>
          Company Overview
        </ThemedText>
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={20} color={colors.text} />
          <ThemedText type="default" style={[styles.value, { color: colors.text, marginLeft: 8 }]}>
            {stockData.companyName} ({stockData.symbol})
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={20} color={colors.text} />
          <ThemedText type="default" style={[styles.value, { color: colors.text, marginLeft: 8 }]}>
            {stockData.sector}
          </ThemedText>
        </View>
      </LinearGradient>
    );
  };

  const renderCurrentPrice = () => {
    if (!stockData) return null;
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <ThemedText type="title" style={[styles.cardTitle, { color: colors.text }]}>
          Current Price
        </ThemedText>
        <View style={styles.priceContainer}>
          <View style={styles.exchangePrice}>
            <ThemedText type="defaultSemiBold" style={[styles.priceValue, { color: colors.text }]}>
              ₹{stockData.currentPrice.toFixed(2)}
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.metric,
                { color: stockData.change >= 0 ? colors.success : colors.error },
              ]}
            >
              {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
            </ThemedText>
          </View>
        </View>
        <View style={styles.priceMetrics}>
          <ThemedText type="default" style={[styles.metric, { color: colors.text }]}>
            Open: ₹{stockData.open.toFixed(2)}
          </ThemedText>
          <ThemedText type="default" style={[styles.metric, { color: colors.text }]}>
            High: ₹{stockData.high.toFixed(2)}
          </ThemedText>
          <ThemedText type="default" style={[styles.metric, { color: colors.text }]}>
            Low: ₹{stockData.low.toFixed(2)}
          </ThemedText>
          <ThemedText type="default" style={[styles.metric, { color: colors.text }]}>
            Volume: {stockData.volume.toLocaleString()}
          </ThemedText>
        </View>
      </LinearGradient>
    );
  };

  const renderTechnicalData = () => {
    if (!stockData) return null;
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <ThemedText type="title" style={[styles.cardTitle, { color: colors.text }]}>
          Key Statistics
        </ThemedText>
        <View style={styles.technicalCard}>
          <ThemedText type="default" style={[styles.maPrice, { color: colors.text }]}>
            Market Cap: ₹{(stockData.marketCap / 1000000000).toFixed(2)}B
          </ThemedText>
          <ThemedText type="default" style={[styles.maPrice, { color: colors.text }]}>
            P/E Ratio: {stockData.peRatio.toFixed(2)}
          </ThemedText>
          <ThemedText type="default" style={[styles.maPrice, { color: colors.text }]}>
            EPS: ₹{stockData.eps.toFixed(2)}
          </ThemedText>
          <ThemedText type="default" style={[styles.maPrice, { color: colors.text }]}>
            Dividend: ₹{stockData.dividend.toFixed(2)}
          </ThemedText>
          <ThemedText type="default" style={[styles.maPrice, { color: colors.text }]}>
            Dividend Yield: {stockData.dividendYield.toFixed(2)}%
          </ThemedText>
        </View>
      </LinearGradient>
    );
  };

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
            {renderStockOverview()}
            {renderCurrentPrice()}
            {renderTechnicalData()}
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
});