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
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData, setStockData] = useState(null);
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
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7'
  };

  const searchStock = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a stock name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${searchQuery.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'cd0ac0840bmshd6334a116996692p12ad12jsn5726d4d6525a',
            'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com',
          },
        }
      );

      const data = await response.json();
      if (data.error) {
        setError('Stock not found');
      } else {
        setStockData(data);
      }
    } catch (err) {
      setError('Failed to fetch stock data');
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
        <Text style={[styles.cardTitle, { color: colors.text }]}>Company Overview</Text>
        <View style={styles.infoRow}>
          <Icon name="business" size={20} color={colors.text} />
          <Text style={[styles.value, { color: colors.text, marginLeft: 8 }]}>{stockData.companyName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="work" size={20} color={colors.text} />
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
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={[styles.title, { color: colors.text }]}>Stock Search</Text>
      </LinearGradient>
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
            <Icon name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error }]}>
            <Icon name="error" size={24} color="#ffffff" />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 5
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  }
});