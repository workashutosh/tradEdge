import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface ServiceItem {
  title: string;
  desc: string;
  traders: string;
  tags: string[];
  credits: string;
  minInvestment: string;
  icon: string;
  categoryTag: string;
  additionalInfo: string[];
}

interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

export default function Trades() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    error: '#ff4444',
    primary: '#00BCD4',
    buttonPrimary: '#6200ee',
    success: '#00c853',
    warning: '#ffab00',
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7',
    tagBackground: isDark ? '#333333' : '#ffffff',
    selectedTagBackground: '#3498db',
  };

  const getTagStyle = (tag: string): { borderColor: string; icon: string } => {
    if (tag.includes('Low Risk'))
      return { borderColor: colors.success, icon: 'check-circle' };
    if (tag.includes('Moderate Risk'))
      return { borderColor: colors.warning, icon: 'warning' };
    if (tag.includes('High Risk'))
      return { borderColor: colors.error, icon: 'error' };
    if (tag.includes('Avg'))
      return { borderColor: colors.primary, icon: 'trending-up' };
    return { borderColor: colors.primary, icon: 'info' };
  };

  const services: ServiceCategory[] = [
    {
      category: 'Intraday Packages',
      items: [
        {
          title: 'Cash Intraday',
          desc: 'Intraday calls for cash market with daily recommendations.',
          traders: '1-2 calls/day',
          tags: ['Moderate Risk', 'Avg ₹2,384/trade'],
          credits: '₹9,500 / 45 Credits',
          minInvestment: '₹25,000',
          icon: 'trending-up',
          categoryTag: 'Equity',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
        {
          title: 'Index Futures',
          desc: 'NIFTY & BANKNIFTY futures with precise entries.',
          traders: '1-2 calls/day',
          tags: ['Moderate Risk', 'Avg ₹4,299/trade'],
          credits: '₹9,000 / 45 Credits',
          minInvestment: '₹50,000',
          icon: 'bar-chart',
          categoryTag: 'Index Future',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
      ],
    },
    {
      category: 'Options Packages',
      items: [
        {
          title: 'Stock Options',
          desc: 'High-accuracy options trading calls.',
          traders: '1-2 calls/day',
          tags: ['High Risk', 'Avg ₹3,524/trade'],
          credits: '₹9,500 / 45 Credits',
          minInvestment: '₹25,000',
          icon: 'tune', // Replaced "options" with "tune"
          categoryTag: 'Stock Option',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
        {
          title: 'Index Options',
          desc: 'Strategic trading for index options.',
          traders: '1-2 calls/day',
          tags: ['Moderate Risk', 'Avg ₹3,126/trade'],
          credits: '₹9,000 / 45 Credits',
          minInvestment: '₹25,000',
          icon: 'tune', // Replaced "options" with "tune"
          categoryTag: 'Index Option',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
      ],
    },
    {
      category: 'Investment Packages',
      items: [
        {
          title: 'Premium Stocks',
          desc: 'Short-term stock picks for consistent gains.',
          traders: '1-2 calls/week',
          tags: ['Low Risk', 'Avg ₹2,652/trade'],
          credits: '₹56,700 / 500 Credits',
          minInvestment: '₹1,00,000',
          icon: 'attach-money',
          categoryTag: 'Equity',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
        {
          title: 'Multibagger Stocks',
          desc: 'High-potential stocks for long-term growth.',
          traders: '10-15 calls/year',
          tags: ['High Risk', 'Avg 100%+'],
          credits: '₹25,000 / Annual',
          minInvestment: '₹1,00,000',
          icon: 'rocket',
          categoryTag: 'Equity',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
      ],
    },
    {
      category: 'Commodity Packages',
      items: [
        {
          title: 'Bullion Trading',
          desc: 'Gold & Silver trading with low-risk strategies.',
          traders: '1-2 calls/day',
          tags: ['Low Risk', 'Avg ₹4,500/trade'],
          credits: '₹9,500 / 45 Credits',
          minInvestment: '₹50,000',
          icon: 'diamond',
          categoryTag: 'MCX Commodities',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
        {
          title: 'Energy Trading',
          desc: 'Crude Oil & Natural Gas market calls.',
          traders: '1-2 calls/day',
          tags: ['High Risk', 'Avg ₹6,000/trade'],
          credits: '₹9,500 / 45 Credits',
          minInvestment: '₹50,000',
          icon: 'oil-barrel',
          categoryTag: 'MCX Commodities',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. ₹5,000 to ₹9,000 Per Lot',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
      ],
    },
    {
      category: 'Specialized Services',
      items: [
        {
          title: 'Swing Trading Package',
          desc: 'Short to medium-term swing trading strategies.',
          traders: '2-3 calls/week',
          tags: ['Moderate Risk', 'Avg 15-20%'],
          credits: '₹15,000 / Quarterly',
          minInvestment: '₹50,000',
          icon: 'trending-up',
          categoryTag: 'Swing Trading',
          additionalInfo: [
            'Get 2-3 Tips per week',
            'Profit approx. 15-20% per trade',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
        {
          title: 'TWM Special Package',
          desc: 'Exclusive trading calls across all segments.',
          traders: '5-10 calls/month',
          tags: ['High Risk', 'Avg 50%+'],
          credits: '₹30,000 / Annual',
          minInvestment: '₹1,00,000',
          icon: 'star',
          categoryTag: 'TWM Package',
          additionalInfo: [
            'Get 5-10 Tips per month',
            'Profit approx. 50%+ per trade',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
        {
          title: 'Forex Trading',
          desc: 'Currency pair trading with daily insights.',
          traders: '1-2 calls/day',
          tags: ['High Risk', 'Avg 2-3%'],
          credits: '₹12,000 / Monthly',
          minInvestment: '₹50,000',
          icon: 'currency-exchange',
          categoryTag: 'Forex',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. 2-3% per trade',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
        {
          title: 'International Club Commodities',
          desc: 'Global commodity trading strategies.',
          traders: '1-2 calls/day',
          tags: ['Moderate Risk', 'Avg 3-5%'],
          credits: '₹20,000 / Quarterly',
          minInvestment: '₹75,000',
          icon: 'public', // Replaced "globe" with "public"
          categoryTag: 'International Club Commodities',
          additionalInfo: [
            'Get 1 Tip per day',
            'Profit approx. 3-5% per trade',
            'Customer Service Support from 9 AM to 6 PM',
            'Tips with Proper Stop Loss & Target',
            'Trading calls via WhatsApp, SMS, and emails',
          ],
        },
      ],
    },
  ];

  const tradingPackageTags = [
    'Equity',
    'Stock Option',
    'Stock Future',
    'Index Option',
    'Index Future',
  ];

  const specializedServiceTags = [
    'Swing Trading',
    'TWM Package',
    'MCX Commodities',
    'Forex',
    'International Club Commodities',
  ];

  const [selectedTradingTag, setSelectedTradingTag] = useState<string>('Equity');
  const [selectedSpecializedTag, setSelectedSpecializedTag] = useState<string>('MCX Commodities');

  const handleTradePress = (item: ServiceItem, category: string) => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        title: item.title,
        desc: item.desc,
        traders: item.traders,
        tags: JSON.stringify(item.tags),
        credits: item.credits,
        minInvestment: item.minInvestment,
        icon: item.icon,
        category: category,
        additionalInfo: JSON.stringify(item.additionalInfo),
      },
    });
  };

  const filteredTradingPackages = services
    .filter((category) => category.category !== 'Specialized Services')
    .flatMap((category) => category.items)
    .filter((item) => item.categoryTag === selectedTradingTag);

  const filteredSpecializedServices = services
    .flatMap((category) => category.items)
    .filter((item) => item.categoryTag === selectedSpecializedTag);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Trades</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Trading Packages Tag Bar */}
        <View style={styles.tagSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Trading Packages
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
            {tradingPackageTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedTradingTag(tag)}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor:
                      selectedTradingTag === tag
                        ? colors.selectedTagBackground
                        : colors.tagBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tradeTagText,
                    {
                      color:
                        selectedTradingTag === tag
                          ? '#ffffff'
                          : isDark
                          ? '#cccccc'
                          : '#666666',
                    },
                  ]}
                >
                  {tag}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trading Packages Content */}
        {filteredTradingPackages.length > 0 ? (
          filteredTradingPackages.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() =>
                handleTradePress(
                  item,
                  services.find((category) =>
                    category.items.some((i) => i.title === item.title)
                  )?.category || ''
                )
              }
              style={styles.cardContainer}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    // borderColor: colors.buttonPrimary,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <MaterialIcons name={item.icon} size={24} color={colors.buttonPrimary} />
                  <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                    {item.title}
                  </ThemedText>
                </View>
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, tagIdx) => {
                    const { borderColor, icon } = getTagStyle(tag);
                    return (
                      <View
                        key={tagIdx}
                        style={[styles.tagContainer, { borderColor: borderColor }]}
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
                  {item.desc}
                </ThemedText>
                <ThemedText style={[styles.traders, { color: colors.text }]}>
                  {item.traders}
                </ThemedText>
                {/* Additional Info Section */}
                {/* <View style={styles.additionalInfoContainer}>
                  {item.additionalInfo.map((info, infoIdx) => (
                    <View key={infoIdx} style={styles.additionalInfoItem}>
                      <MaterialIcons
                        name="check"
                        size={16}
                        color={colors.success}
                        style={styles.checkIcon}
                      />
                      <ThemedText style={[styles.additionalInfoText, { color: colors.text }]}>
                        {info}
                      </ThemedText>
                    </View>
                  ))}
                </View> */}

                <View style={styles.priceRow}>
                  <ThemedText style={[styles.minInvestment, { color: colors.primary }]}>
                    Min. Investment: {item.minInvestment}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: colors.buttonPrimary }]}
                  onPress={() =>
                    handleTradePress(
                      item,
                      services.find((category) =>
                        category.items.some((i) => i.title === item.title)
                      )?.category || ''
                    )
                  }
                >
                  <ThemedText style={styles.exploreButtonText}>Explore</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <ThemedText style={[styles.noItemsText, { color: colors.text }]}>
            No packages available for this category.
          </ThemedText>
        )}

        {/* Specialized Services Tag Bar */}
        <View style={styles.tagSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Specialized Services
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
            {specializedServiceTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedSpecializedTag(tag)}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor:
                      selectedSpecializedTag === tag
                        ? colors.selectedTagBackground
                        : colors.tagBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tradeTagText,
                    {
                      color:
                        selectedSpecializedTag === tag
                          ? '#ffffff'
                          : isDark
                          ? '#cccccc'
                          : '#666666',
                    },
                  ]}
                >
                  {tag}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Specialized Services Content */}
        {filteredSpecializedServices.length > 0 ? (
          filteredSpecializedServices.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() =>
                handleTradePress(
                  item,
                  services.find((category) =>
                    category.items.some((i) => i.title === item.title)
                  )?.category || ''
                )
              }
              style={styles.cardContainer}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    // borderColor: colors.buttonPrimary,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <MaterialIcons name={item.icon} size={24} color={colors.buttonPrimary} />
                  <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                    {item.title}
                  </ThemedText>
                </View>
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, tagIdx) => {
                    const { borderColor, icon } = getTagStyle(tag);
                    return (
                      <View
                        key={tagIdx}
                        style={[styles.tagContainer, { borderColor: borderColor }]}
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
                  {item.desc}
                </ThemedText>
                <ThemedText style={[styles.traders, { color: colors.text }]}>
                  {item.traders}
                </ThemedText>
                {/* Additional Info Section */}
                {/* <View style={styles.additionalInfoContainer}>
                  {item.additionalInfo.map((info, infoIdx) => (
                    <View key={infoIdx} style={styles.additionalInfoItem}>
                      <MaterialIcons
                        name="check"
                        size={16}
                        color={colors.success}
                        style={styles.checkIcon}
                      />
                      <ThemedText style={[styles.additionalInfoText, { color: colors.text }]}>
                        {info}
                      </ThemedText>
                    </View>
                  ))}
                </View> */}

                <View style={styles.priceRow}>
                  <ThemedText style={[styles.minInvestment, { color: colors.primary }]}>
                  Min. Investment: {item.minInvestment}
                  </ThemedText>
                </View>
                  <TouchableOpacity
                    style={[styles.exploreButton, { backgroundColor: colors.buttonPrimary }]}
                    onPress={() =>
                      handleTradePress(
                        item,
                        services.find((category) =>
                          category.items.some((i) => i.title === item.title)
                        )?.category || ''
                      )
                    }
                  >
                    <ThemedText style={styles.exploreButtonText}>Explore</ThemedText>
                  </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <ThemedText style={[styles.noItemsText, { color: colors.text }]}>
            No services available for this category.
          </ThemedText>
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
    paddingVertical: 4,
    paddingHorizontal: 8,
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
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3498db',
    boxShadow: '0 0 6px #3498db',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardDesc: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
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
  traders: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '700',
  },
  additionalInfoContainer: {
    marginBottom: 12,
  },
  additionalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    marginRight: 8,
  },
  additionalInfoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  minInvestment: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exploreButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
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