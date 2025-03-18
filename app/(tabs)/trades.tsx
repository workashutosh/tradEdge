import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Dimensions,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Trades() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    primary: '#00BCD4',
    buttonPrimary: '#6200ee',
    shadowColor: isDark ? 'white' : 'black',
    selectedTagBackground: '#3498db',
    tagBackground: isDark ? '#333333' : '#e0e0e0',
    success: '#00c853',
    warning: '#ffab00',
    error: '#ff4444',
  };

  interface ServiceItem {
    title: string; // subtype_name or type_name if no subtypes
    price: string; // Price in rupees
    details: string[]; // List of details
    categoryTag: string; // type_name
    icon: string; // Icon based on category
    tags: string[]; // Two random tags
  }

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Random tags pool from previous code
  const randomTags = [
    'Low Risk',
    'Moderate Risk',
    'High Risk',
    'Avg ₹2,000/trade',
    'Avg ₹5,000/trade',
    'Avg 10%+',
  ];

  const getRandomTags = () => {
    const shuffled = randomTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2); // Return 2 random tags
  };

  const getTagStyle = (tag: string): { borderColor: string; icon: string } => {
    if (tag.includes('Low Risk')) return { borderColor: colors.success, icon: 'check-circle' };
    if (tag.includes('Moderate Risk')) return { borderColor: colors.warning, icon: 'warning' };
    if (tag.includes('High Risk')) return { borderColor: colors.error, icon: 'error' };
    if (tag.includes('Avg')) return { borderColor: colors.primary, icon: 'trending-up' };
    return { borderColor: colors.primary, icon: 'info' };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const apiResponse = await fetch('http://gateway.twmresearchalert.com/package', {
          headers: {
            Authorization: token || '',
          },
        });

        const responseJson = await apiResponse.json();
        console.log(responseJson);

        if (responseJson.status === 'success') {
          const transformedServices: ServiceItem[] = responseJson.data.flatMap((type: any) => {
            const items = type.subtypes.length > 0
              ? type.subtypes
              : [{ subtype_name: type.type_name, price: type.price, details: type.details || [] }];

            return items.map((item: any) => ({
              title: item.subtype_name,
              price: item.price ? `₹${String(item.price)}` : 'Contact for pricing',
              details: item.details || ['Details not available'],
              categoryTag: type.type_name,
              icon: getIconForCategory(type.type_name),
              tags: getRandomTags(), // Assign 2 random tags
            }));
          });

          const uniqueTags = [...new Set(responseJson.data.map((type: any) => type.type_name))] as string[];
          setTags(uniqueTags);
          setSelectedTag(uniqueTags[0] || '');
          setServices(transformedServices);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Equity': return 'trending-up';
      case 'Stock Option': return 'tune';
      case 'Stock Future': return 'bar-chart';
      case 'Index Option': return 'tune';
      case 'Index Future': return 'bar-chart';
      case 'Swing Trading': return 'trending-up';
      case 'TWM Package (All In One)': return 'star';
      case 'MCX Commodities': return 'diamond';
      case 'Forex': return 'currency-exchange';
      case 'International Club Commodities': return 'public';
      default: return 'info';
    }
  };

  const handleTradePress = (item: ServiceItem) => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        title: item.title,
        price: item.price,
        details: JSON.stringify(item.details),
        categoryTag: item.categoryTag,
        icon: item.icon,
        tags: JSON.stringify(item.tags), // Pass tags to TradeDetails
      },
    });
  };

  const filteredServices = services.filter(
    (item) => item.categoryTag === selectedTag
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Trades</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tags Bar */}
        <View style={styles.tagSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedTag(tag)}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor: selectedTag === tag ? colors.selectedTagBackground : colors.tagBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tradeTagText,
                    { color: selectedTag === tag ? '#ffffff' : isDark ? '#cccccc' : '#666666' },
                  ]}
                >
                  {tag}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Services Content */}
        {filteredServices.length > 0 ? (
          filteredServices.map((item, idx) => (
            <ThemedView key={idx} style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}>
              <TouchableOpacity onPress={() => handleTradePress(item)}>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name={item.icon} size={24} color={colors.buttonPrimary} />
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
                  </View>
                  <View style={styles.tagsContainer}>
                    {item.tags.map((tag, tagIdx) => {
                      const { borderColor, icon } = getTagStyle(tag);
                      return (
                        <View
                          key={tagIdx}
                          style={[styles.tagContainer, { borderColor }]}
                        >
                          <MaterialIcons name={icon} size={14} color={borderColor} />
                          <ThemedText style={[styles.tagText, { color: borderColor }]}>
                            {tag}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                  <ThemedText style={[styles.cardDesc, { color: colors.text }]}>
                    {item.details[0]}
                  </ThemedText>
                  <ThemedText style={[styles.cardPrice, { color: colors.primary }]}>
                    {item.price}
                  </ThemedText>
                  <TouchableOpacity
                    style={[styles.exploreButton, { backgroundColor: colors.buttonPrimary }]}
                    onPress={() => handleTradePress(item)}
                  >
                    <ThemedText style={styles.exploreButtonText}>Proceed to Pay</ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={[styles.noItemsText, { color: colors.text }]}>
            No packages available for this category.
          </ThemedText>
        )}
        <ThemedView style={{ paddingBottom: 70, backgroundColor: colors.background }} />
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
    padding: 16,
  },
  tagSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagScroll: {
    flexDirection: 'row',
  },
  tagButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tradeTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    paddingVertical: 1,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardDesc: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  exploreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
});