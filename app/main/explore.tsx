import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Image, SafeAreaView, useColorScheme } from 'react-native';

export default function TabTwoScreen() {
  const [ipoData, setIpoData] = useState({ upcoming: [], active: [], closed: [] });
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const data = null;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        setIpoData(JSON.parse(this.responseText));
      }
    });

    xhr.open('GET', 'https://indian-stock-exchange-api2.p.rapidapi.com/ipo');
    xhr.setRequestHeader('x-rapidapi-key', 'cd0ac0840bmshd6334a116996692p12ad12jsn5726d4d6525a');
    xhr.setRequestHeader('x-rapidapi-host', 'indian-stock-exchange-api2.p.rapidapi.com');
    xhr.send(data);
  }, []);

  const renderIpoItem = (item) => (
    <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
      {item.logo && <Image source={{ uri: item.logo }} style={styles.cardLogo} />}
      <View style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, isDarkMode ? styles.textDark : styles.textLight]}>{item.name}</Text>
        <Text style={[styles.cardSubtitle, isDarkMode ? styles.textDark : styles.textLight]}>{item.additional_text || 'Bidding dates yet to be announced'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.backgroundDark : styles.backgroundLight]}>
      <View style={[styles.header, isDarkMode ? styles.headerDark : styles.headerLight]}>
        <Text style={[styles.headerTitle, isDarkMode ? styles.textDark : styles.textLight]}>IPO Listings</Text>
      </View>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, isDarkMode ? styles.textDark : styles.textLight]}>Open</Text>
            {ipoData.active.length > 0 ? (
              ipoData.active.map((item) => renderIpoItem(item))
            ) : (
              <Text style={[styles.placeholderText, isDarkMode ? styles.textDark : styles.textLight]}>No open IPOs. Please wait for upcoming IPOs to open.</Text>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, isDarkMode ? styles.textDark : styles.textLight]}>Closed</Text>
            {ipoData.closed.length > 0 ? (
              ipoData.closed.map((item) => renderIpoItem(item))
            ) : (
              <Text style={[styles.placeholderText, isDarkMode ? styles.textDark : styles.textLight]}>No closed IPOs at the moment.</Text>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, isDarkMode ? styles.textDark : styles.textLight]}>Upcoming</Text>
            {ipoData.upcoming.length > 0 ? (
              ipoData.upcoming.map((item) => renderIpoItem(item))
            ) : (
              <Text style={[styles.placeholderText, isDarkMode ? styles.textDark : styles.textLight]}>No upcoming IPOs currently.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundLight: {
    backgroundColor: '#f8f9fa', // Light gray background
  },
  backgroundDark: {
    backgroundColor: '#1a1a1a', // Dark gray background
  },
    header: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  headerLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#2a2a2a',
    borderBottomColor: '#4a4a4a',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Light gray border
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500', // Slightly lighter font weight
    marginBottom: 10,
    paddingLeft: 5,
  },
  card: {
    flexDirection: 'row', // Align logo and text horizontally
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center', // Center items vertically
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#2a2a2a',
  },
  cardLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain', // Ensure logo fits within bounds
  },
  cardTextContainer: {
    flex: 1, // Take up remaining space
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500', // Slightly lighter font weight
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  placeholderText: {
    fontSize: 14,
    marginTop: 8,
    paddingLeft: 5,
  },
  textLight: {
      color: '#333',
  },
    textDark: {
      color: '#f8f9fa',
  },
});