import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  interface IpoItem {
    logo?: string;
    name?: string;
    additional_text?: string;
  }

  const [ipoData, setIpoData] = useState<{ upcoming: IpoItem[]; active: IpoItem[]; closed: IpoItem[] }>({ upcoming: [], active: [], closed: [] });
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          try {
            const data = JSON.parse(this.responseText);
            // Ensure all required arrays exist, even if API doesn't provide them
            setIpoData({
              upcoming: data.upcoming || [],
              active: data.active || [],
              closed: data.closed || []
            });
          } catch (e) {
            setError('Failed to parse API response');
            setIpoData({ upcoming: [], active: [], closed: [] });
          }
        } else {
          setError("Cant't fetch data");
          setIpoData({ upcoming: [], active: [], closed: [] });
        }
      }
    });

    xhr.open('GET', 'https://indian-stock-exchange-api2.p.rapidapi.com/ipo');
    xhr.setRequestHeader('x-rapidapi-key', 'bc620173a1msh189575d170e4385p16222fjsnfad95363999a');
    xhr.setRequestHeader('x-rapidapi-host', 'indian-stock-exchange-api2.p.rapidapi.com');
    xhr.send(null);

    // Cleanup function
    return () => {
      xhr.abort();
    };
  }, []);

  const IpoSection: React.FC<{ title: string; data?: IpoItem[] }> = ({ title, data = [] }) => (  // Default empty array if data is undefined
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
                {item.name || 'Unknown'}
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
      <View style={[styles.header]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>IPO Listings</Text>
      </View>
      {error && (
        <Text style={[styles.errorText, isDarkMode && styles.textDark]}>
          Error: {error}
        </Text>
      )}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <IpoSection title="Open" data={ipoData.active} />
        <IpoSection title="Upcoming" data={ipoData.upcoming} />
        <IpoSection title="Closed" data={ipoData.closed} />
        <ThemedView style={[{paddingBottom: 70, backgroundColor: isDarkMode ? '#121212' : '#f5f7fa'}]} />
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
  },
  headerTitle: {
    fontSize: 20,
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
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    padding: 10,
  },
});