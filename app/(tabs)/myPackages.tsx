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
  Button,
  Linking
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useStockContext } from '@/context/StockContext';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useTheme, ThemeHookReturn } from '@/utils/theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { BadgeCheck, BadgeIndianRupeeIcon } from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedButton';
import { AnimatedLinkButton } from '@/components/AnimatedLinkButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useUser } from '@/context/UserContext';

type Package = {
  type_id: string;
  type_name: string;
  package_id: string;
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  minimumInvestment?: string;
  riskCategory?: string;
  profitPotential?: string;
};

const { width } = Dimensions.get('window');

// Refactor styles to be a function that accepts colors
const getStyles = (colors: ThemeHookReturn) => StyleSheet.create({
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
    paddingVertical: 16,
  },
  tagSection: {
    paddingTop: 10,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagScroll: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    //backgroundColor: 'red'
  },
  tagButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  tradeTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardContainer: {
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: 'grey', // Consider using colors.text with opacity or a specific themed grey
    fontSize: 14,
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  detailBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  detailIcon: {
    alignSelf: 'flex-end',
    marginRight: 2,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 0,
    textAlign: 'center',
    color: colors.text,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  enquiryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  fullDetailsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0', // Consider using a theme color for border
  },
  fullDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailCheckIcon: {
    marginRight: 8,
    marginTop: 4, // Adjust for text baseline alignment
  },
  fullDetailText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  showDetailsButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    width: '100%', // Make button full width
    alignItems: 'center', // Center the text
  },
  showDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function Trades() {
  // const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';

  const colors: ThemeHookReturn = useTheme(); // Get colors using the hook
  const styles = getStyles(colors); // Get styles using the function with colors

  const { packages, loading } = useStockContext();
  const { userDetails, userTransactions } = useUser();

  // 1. Filter valid transactions
const purchasedPackages = (userTransactions || []).filter(txn => txn.payment_history?.length > 0);

// 2. Total investment = sum of all package prices
const totalInvestment = purchasedPackages.reduce((total, item) => {
  return total + Number(item.package_details?.package_price || 0);
}, 0);

// 3. Total trades = number of purchased packages
const totalTrades = purchasedPackages.length;

// 4. Estimated profit = sum of profitPotential (if available)
const estimatedProfit = purchasedPackages.reduce((total, item) => {
  const profitStr = item.package_details?.profitPotential?.replace(/[^0-9.-]/g, '');
  const profit = profitStr ? Number(profitStr) : 0;
  return total + profit;
}, 0);


  const uniqueTags = [...new Set(packages.map((pack) => pack.categoryTag))] as string[];
  const tags = uniqueTags.length > 0 ? uniqueTags : [''];
  const [selectedTag, setSelectedTag] = useState<string>(tags[0]);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());


  const getTagStyle = (riskCategory: string): { color: string; icon: string } => {
    if (riskCategory.includes('Low')) return { color: colors.success, icon: 'check-circle' };
    return { color: colors.error, icon: 'error' };
  };

  const handleTradePress = (item: Package) => {
    console.log(item);
    // We don't want to navigate when the user intends to expand/collapse details
    // router.push({
    //   pathname: '/main/TradeDetails',
    //   params: {
    //     package_id: item.package_id,
    //   },
    // });
  };

  const toggleDetails = (packageId: string) => {
    setExpandedPackages(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(packageId)) {
        newExpanded.delete(packageId);
      } else {
        newExpanded.add(packageId);
      }
      return newExpanded;
    });
  };

  const filteredServices = packages.map((pack) => ({
    ...pack,
    // profitPotential: '15-25% p.a.', // Dummy data
  })).filter((item) => item.categoryTag === selectedTag);

  const handleBuyNow = async (item: Package) => {
    const transaction_id = `TXN_${Date.now()}`;
    const payment_date = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    try {
      await AsyncStorage.setItem(
        'transactionDetails',
        JSON.stringify({
          package_id: item.package_id,
          user_id: userDetails?.user_id,
          amount: item.price,
          payment_date: payment_date,
          transaction_id: transaction_id,
        })
      );
      const result = await axios.post('https://tradedge-server.onrender.com/api/paymentURL', {
        redirectUrl: `exp://192.168.1.26:8081/--/paymentResult`,
        amount: Number(item.price),
        user_id: userDetails?.user_id,
        package_id: item.package_id,
        transaction_id: transaction_id,
        payment_date: payment_date,
      });
      const response = result.data;
      const paymentUrl = response.redirectUrl;
      if (!paymentUrl) {
        alert('Payment URL not received. Please try again.');
        return;
      }
      Linking.openURL(paymentUrl).catch((err) => {
        alert('Failed to open the URL. Please try again later.');
      });
    } catch (error) {
      alert('Failed to open the URL. Please try again later.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={"Packs"} showBuyProButton={true} />

      {/* Fixed Tags Bar */}
      <View style={[styles.tagSection, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
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
                type="defaultSemiBold"
                style={[
                  styles.tradeTagText,
                  { color: selectedTag === tag ? colors.selectedTagText : colors.tagText },
                ]}
              >
                {tag}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: 10 }]}>
        {filteredServices.length > 0 ? (
          filteredServices.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleTradePress(item)} // Make the whole card clickable
              activeOpacity={0.7} // Ensure the card click doesn't interfere with button clicks
              style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}>
              <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
                {/* Header Section */}
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText
                      style={[styles.cardTitle, { color: colors.vgreen }]} // Assuming vgreen for title as seen in TradeDetails
                    >
                      {item.title}
                    </ThemedText>
                    <BadgeCheck size={24} color={colors.success} style={{ marginLeft: 5 }} />
                  </View>
                  <ThemedText type="subtitle" style={[styles.cardSubtitle, { color: colors.text }]}> 
                    Tradedge Package
                  </ThemedText>
                </View>

                {/* Details Section */}
                <View style={styles.cardDetails}>
                  <View style={styles.detailBox}>
                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                    <ThemedText type="subtitle" style={[styles.detailLabel, { color: colors.text }]}>
                      Min Investment
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                      ₹ {item.minimumInvestment && !isNaN(Number(item.minimumInvestment)) ? new Intl.NumberFormat('en-IN').format(Number(item.minimumInvestment)) : 'N/A'}
                    </ThemedText>
                  </View>
                  <View style={styles.detailBox}>
                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                    <ThemedText type="subtitle" style={[styles.detailLabel, { color: colors.text }]}>
                      Risk Category
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                      {item.riskCategory || 'N/A'}
                    </ThemedText>
                  </View>
                  <View style={styles.detailBox}>
                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                    <ThemedText type="subtitle" style={[styles.detailLabel, { color: colors.text }]}>
                      Profit Potential
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={[styles.detailValue, { color: colors.text }]}>
                      {item.profitPotential || 'N/A'}
                    </ThemedText>
                  </View>
                </View>

                {/* Full Details Section (Conditionally Rendered) */}
                {expandedPackages.has(item.package_id) && (
                  <View style={styles.fullDetailsSection}>
                    <ThemedText type="subtitle" style={[styles.fullDetailsTitle, { color: colors.text }]}>What we offer:</ThemedText>
                    {item.details && item.details.map((detail, index) => (
                      <View key={index} style={styles.detailItem}>
                        <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailCheckIcon} />
                        <ThemedText type="default" style={[styles.fullDetailText, { color: colors.text }]}>{detail}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Show/Hide Details Button */}
                {/* {console.log('Rendering Show/Hide Details Button for package:', item.package_id, 'Expanded:', expandedPackages.has(item.package_id))} */}
                <TouchableOpacity
                  style={[styles.showDetailsButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
                  onPress={() => {
                    router.push({
                      pathname: '/main/TradeDetails',
                      params: {
                        package_id: item.package_id,
                      },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.showDetailsButtonText, { color: 'white' }]}>
                    Open Package
                  </ThemedText>
                </TouchableOpacity>

                {/* Buttons Section */}
                <View style={styles.buttonRow}>
                  <AnimatedButton
                    title="Enquiry"
                    icon={<FontAwesome name="phone" size={14} color={colors.card} style={{ marginRight: 5 }} />}
                    onPress={() => Linking.openURL('tel:7400330785')}
                    variant="secondary"
                    style={[{ flex: 1, paddingVertical: 12, alignSelf: 'center' }, styles.enquiryButton]}
                  />

                  <AnimatedLinkButton
                    title="Buy Now"
                    onPress={() => handleBuyNow(item)}
                    style={{ flex: 1, paddingVertical: 12, alignSelf: 'center' }}
                    icon="shopping-cart"
                    showShimmer={true}
                  />
                </View>
              </ThemedView>
            </TouchableOpacity>
          ))
        ) : (
          <ThemedText type="default" style={[styles.noItemsText, { color: colors.text }]}>
            No packages available for this category.
          </ThemedText>
        )}
        <ThemedView style={{ paddingBottom: 70, backgroundColor: colors.background }} />
      </ScrollView>
    </SafeAreaView>
  );
}