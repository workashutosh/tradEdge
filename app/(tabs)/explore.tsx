import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, useColorScheme } from 'react-native';

export default function TabTwoScreen() {
  const [ipoData, setIpoData] = useState({ upcoming: [], active: [], closed: [] });
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
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
    xhr.send(null);
  }, []);

  const IpoSection = ({ title, data }) => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
        {title} <Text style={styles.count}>({data.length})</Text>
      </Text>
      {data.length > 0 ? (
        data.map((item, index) => (
          <View 
            key={index}
            style={[
              styles.card,
              isDarkMode ? styles.cardDark : styles.cardLight,
              index === data.length - 1 && styles.lastCard
            ]}
          >
            {item.logo && (
              <View style={styles.logoContainer}>
                <Image source={{ uri: item.logo }} style={styles.cardLogo} />
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, isDarkMode && styles.textDark]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.cardSubtitle, isDarkMode && styles.textDark]} numberOfLines={2}>
                {item.additional_text || 'Bidding dates yet to be announced'}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, isDarkMode && styles.textDark]}>
          No {title.toLowerCase()} IPOs at the moment
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.backgroundDark : styles.backgroundLight]}>
      <View style={[styles.header, isDarkMode ? styles.headerDark : styles.headerLight]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>IPO Listings</Text>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <IpoSection title="Open" data={ipoData.active} />
        <IpoSection title="Upcoming" data={ipoData.upcoming} />
        <IpoSection title="Closed" data={ipoData.closed} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#eef1f5',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#2d2d2d',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  count: {
    color: '#666',
    fontWeight: '400',
  },
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  lastCard: {
    marginBottom: 0,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  textDark: {
    color: '#ffffff',
  },
});