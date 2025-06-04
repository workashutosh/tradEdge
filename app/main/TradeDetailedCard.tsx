import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/utils/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TradeDetailedCard = () => {
  const colors = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();

  // Destructure all params passed from the More Info button
  const {
    stockSymbol,
    stockName,
    entryPrice,
    targetPrice,
    stopLoss,
    timeFrame,
    analysis,
    riskLevel,
    recommendedInvestment,
    timestamp,
    confidence,
    potentialProfit = 0,
    potentialLoss = 0,
    predictionType,
  } = params;

  // State for live stock data
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockSymbol) return;
    setLoading(true);
    setError(null);
    // Example API endpoint for live stock data (replace with your real API)
    // This demo uses a free public API for demonstration; replace as needed
    fetch(`https://latest-stock-price.p.rapidapi.com/price?Indices=NSE:${stockSymbol},BSE:${stockSymbol},NSE:NIFTY%2050`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with your API key
        'X-RapidAPI-Host': 'latest-stock-price.p.rapidapi.com',
      },
    })
      .then(res => res.json())
      .then(data => {
        setLiveData(data);
      })
      .catch(err => {
        setError('Failed to fetch live stock data');
      })
      .finally(() => setLoading(false));
  }, [stockSymbol]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <MaterialIcons name="arrow-back" size={28} color={colors.primary} style={{ marginRight: 8 }} onPress={() => router.back()} />
          <ThemedText type="title" style={[styles.title, { color: colors.text, flex: 1 }]}>{stockName?.toString().toUpperCase()}</ThemedText>
        </View>
        <ThemedText style={[styles.symbol, { color: colors.text }]}>{stockSymbol}</ThemedText>
        {/* Live Stock Data Section */}
        <View style={{ marginBottom: 16 }}>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 16, color: colors.primary, marginBottom: 4 }}>Live Stock Data</ThemedText>
          {loading && <ActivityIndicator color={colors.primary} size="small" />}
          {error && <ThemedText style={{ color: colors.error }}>{error}</ThemedText>}
          {liveData && Array.isArray(liveData) && (
            <View>
              {liveData.map((item, idx) => (
                <View key={idx} style={{ marginBottom: 4, backgroundColor: colors.card, borderRadius: 8, padding: 8, marginTop: 4, shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                  <ThemedText style={{ color: colors.text, fontWeight: '600' }}>{item.symbol} ({item.exchange || item.indexName})</ThemedText>
                  <ThemedText style={{ color: colors.success }}>Last Price: ₹ {item.lastPrice}</ThemedText>
                  <ThemedText style={{ color: item.pChange > 0 ? colors.success : colors.error }}>
                    Change: {item.pChange}%
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
        {/* Important Details in Boxes */}
        <View style={styles.boxGrid}>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.primary }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.primary }]}>Entry Price</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.primary }]}>₹ {Number(entryPrice).toFixed(2)}</ThemedText>
          </View>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.success }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.success }]}>Target Price</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.success }]}>₹ {Number(targetPrice).toFixed(2)}</ThemedText>
          </View>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.error }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.error }]}>Stop Loss</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.error }]}>₹ {Number(stopLoss).toFixed(2)}</ThemedText>
          </View>
        </View>
        <View style={styles.boxGrid}>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.warning }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.warning }]}>Risk Level</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.warning }]}>{riskLevel}</ThemedText>
          </View>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.info || (colors.isDarkMode ? '#2196F3' : '#1976D2') }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.info || (colors.isDarkMode ? '#2196F3' : '#1976D2') }]}>Confidence</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.info || (colors.isDarkMode ? '#2196F3' : '#1976D2') }]}>{confidence}%</ThemedText>
          </View>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.success }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.success }]}>Profit Potential</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.success }]}>{potentialProfit}%</ThemedText>
          </View>
        </View>
        <View style={styles.boxGrid}>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.error }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.error }]}>Potential Loss</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.error }]}>{potentialLoss}%</ThemedText>
          </View>
          <View style={[styles.infoBox, { borderWidth: 2, borderColor: colors.primary }]}> 
            <ThemedText style={[styles.infoBoxLabel, { color: colors.primary }]}>Investment</ThemedText>
            <ThemedText style={[styles.infoBoxValue, { color: colors.primary }]}>₹ {recommendedInvestment}</ThemedText>
          </View>
          <View style={[
            styles.infoBox,
            {
              borderWidth: 2,
              borderColor: colors.warning,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.warning + (colors.isDarkMode ? '22' : '18'), // subtle badge bg
              paddingVertical: 10,
              paddingHorizontal: 8,
            },
          ]}>
            <MaterialIcons name="schedule" size={22} color={colors.warning} style={{ marginRight: 10 }} />
            <View style={{ alignItems: 'flex-start', flex: 1 }}>
              <ThemedText style={[styles.infoBoxLabel, { color: colors.warning, fontSize: 15, marginBottom: 4 }]}>Time Frame</ThemedText>
              {/*<View style={{
                backgroundColor: colors.warning,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 4,
                alignSelf: 'flex-start',
                marginTop: 2,
              }}> */}
                <ThemedText style={{ color: colors.isDarkMode ? '#fff' : '#222', fontWeight: 'bold', fontSize: 15 }}>{timeFrame}</ThemedText>
              </View>
            </View>
          </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: colors.card, borderRadius: 14, padding: 10, shadowColor: colors.shadowColor, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
          <MaterialIcons name="event" size={22} color={colors.primary} style={{ marginRight: 10 }} />
          <ThemedText style={[styles.label, { color: colors.text, fontSize: 16, fontWeight: '700' }]}>Date: <ThemedText style={[styles.value, { color: colors.text, fontWeight: '700', fontSize: 16 }]}>{timestamp ? new Date(timestamp as string).toLocaleString() : ''}</ThemedText></ThemedText>
        </View>
        <ThemedText style={[styles.analysis, { color: colors.text, marginTop: 18 }]}>Analysis:</ThemedText>
        <ThemedText style={[styles.value, { color: colors.text, marginBottom: 24 }]}>{analysis}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  symbol: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    fontWeight: '400',
    fontSize: 16,
  },
  analysis: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  boxGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBoxLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
    fontWeight: '700', // increased from 600
  },
  infoBoxValue: {
    fontSize: 16,
    fontWeight: '700', // increased from bold/700
    color: '#222',
  },
});

export default TradeDetailedCard;
