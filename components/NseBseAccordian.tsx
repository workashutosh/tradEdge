import { View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, useColorScheme, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useStockContext } from '../context/StockContext';

interface StockData {
  ticker: string;
  price: number;
  high: number;
  low: number;
  netChange: number;
  percentChange: number;
}

const NseBseAccordian: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    primary: '#6200ee',
    success: '#00c853',
    yellowBorder: '#ffab00',
    shadowColor: isDark ? '#000000' : '#666666',
  };

  const { NSEData, BSEData, loading } = useStockContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current; // Animation value for height

  // Toggle expansion with animation
  const toggleAccordion = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: false, // Set to false for layout animations
    }).start();
    setIsExpanded(!isExpanded);
  };

  // Interpolate height for smooth expansion
  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 340], // Adjust the expanded height as needed
    extrapolate: 'clamp',
  });

  const NSEBSECard = ({ item }: { item: StockData }) => {
    const isGain = item.netChange > 0;
    return (
      <ThemedView style={[styles.NSEBSECard, { 
        borderColor: isGain ? "green" : "red", 
        backgroundColor: colors.card, 
        shadowColor: colors.shadowColor 
      }]}>
        <ThemedText style={[styles.cardTitle, { 
          color: isGain ? 'green' : 'red', 
          fontSize: 15 
        }]}>
          {item.ticker} {isGain ? '▲' : '▼'} {item.percentChange}%
        </ThemedText>
        <ThemedView style={[{ backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.cardDescription, { 
            color: isDark ? '#bbbbbb' : '#666', 
            fontWeight: '600' 
          }]}>
            {item.price}
          </ThemedText>
          <ThemedView style={[{ 
            backgroundColor: 'transparent', 
            flexDirection: 'row', 
            justifyContent: 'space-between' 
          }]}>
            <ThemedText style={[styles.cardDescription, { 
              color: isDark ? '#bbbbbb' : '#666' 
            }]}>
              High: {item.high}
            </ThemedText>
            <ThemedText style={[styles.cardDescription, { 
              color: isDark ? '#bbbbbb' : '#666' 
            }]}>
              Low: {item.low}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.text }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.statusText, { color: colors.text }]}>
          Trending stocks
        </ThemedText>
        <TouchableOpacity
          style={[styles.expandButton, { }]}
          onPress={toggleAccordion}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={isDark?'white':'black'}
          />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.expandedContainer, { height: contentHeight, opacity: animation }]}>
        <View style={[styles.innerContainer, isDark ? styles.cardDark : styles.cardLight]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading stock data</ThemedText>
              <ActivityIndicator size="large" color={colors.text} />
            </View>
          ) : (
            <>
              {/* NSE Section */}
              <ThemedView style={[styles.sectionContainer, {  }]}>
                <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
                  NSE Most Active
                </ThemedText>
                {NSEData.length === 0 ? (
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
                )}
              </ThemedView>

              {/* BSE Section */}
              <ThemedView style={[styles.sectionContainer, {  }]}>
                <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
                  BSE Most Active
                </ThemedText>
                {BSEData.length === 0 ? (
                  <ThemedText style={[{ color: colors.text, alignSelf: "center" }]}>
                    No BSE data Available
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
                )}
              </ThemedView>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    borderRadius: 10,
    paddingVertical: 12,
    // borderWidth: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
},
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,

    // marginBottom: 10, // Space between header and content
    // backgroundColor: 'red',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
  },
  expandButton: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContainer: {
    overflow: 'hidden', // Ensures content is clipped during animation
  },
  innerContainer: {
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: 'red',
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  sectionContainer: {
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
    paddingHorizontal: 12,

  },
  cardList: {
    paddingVertical: 5,
  },
  NSEBSECard: {
    borderWidth: 1,
    width: 200,
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 20,
    width: '85%',
  },
  cardDescription: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    gap: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default NseBseAccordian;