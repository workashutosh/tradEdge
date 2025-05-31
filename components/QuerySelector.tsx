import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QuerySelectorProps {
  onSelect: (market: 'NSE' | 'BSE' | 'NIFTY') => void;
}

const QuerySelector: React.FC<QuerySelectorProps> = ({ onSelect }) => {
  const [selectedMarket, setSelectedMarket] = useState<'NSE' | 'BSE' | 'NIFTY' | null>(null);
  const [result, setResult] = useState<number>(0);

  const handleSelect = (market: 'NSE' | 'BSE' | 'NIFTY') => {
    setSelectedMarket(market);
    // Simulate a result value between -100 and 100
    const randomResult = Math.floor(Math.random() * 201) - 100;
    setResult(randomResult);
    onSelect(market);
  };

  const getBarColor = (value: number) => {
    if (value > 0) return '#4CAF50'; // Green for positive
    if (value < 0) return '#F44336'; // Red for negative
    return '#9C27B0'; // Purple for zero
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, selectedMarket === 'NSE' && styles.selectedButton]}
          onPress={() => handleSelect('NSE')}
        >
          <Text style={[styles.buttonText, selectedMarket === 'NSE' && styles.selectedButtonText]}>NSE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedMarket === 'BSE' && styles.selectedButton]}
          onPress={() => handleSelect('BSE')}
        >
          <Text style={[styles.buttonText, selectedMarket === 'BSE' && styles.selectedButtonText]}>BSE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedMarket === 'NIFTY' && styles.selectedButton]}
          onPress={() => handleSelect('NIFTY')}
        >
          <Text style={[styles.buttonText, selectedMarket === 'NIFTY' && styles.selectedButtonText]}>NIFTY</Text>
        </TouchableOpacity>
      </View>

      {selectedMarket && (
        <View style={styles.resultContainer}>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  width: `${Math.abs(result)}%`,
                  backgroundColor: getBarColor(result),
                  marginLeft: result < 0 ? 'auto' : 0,
                },
              ]}
            />
          </View>
          <Text style={styles.resultText}>
            {selectedMarket}: {result}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
  },
  resultContainer: {
    marginTop: 16,
  },
  barContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  resultText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});

export default QuerySelector; 