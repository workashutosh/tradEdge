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
import { useTheme } from '@/utils/theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { BadgeIndianRupeeIcon } from 'lucide-react-native';
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

export default function Trades() {
  // const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';

  const colors = useTheme();

  const { packages, loading } = useStockContext();

  const uniqueTags = [...new Set(packages.map((pack) => pack.categoryTag))] as string[];
  const tags = uniqueTags.length > 0 ? uniqueTags : [''];
  const [selectedTag, setSelectedTag] = useState<string>(tags[0]);


  const getTagStyle = (riskCategory: string): { color: string; icon: string } => {
    if (riskCategory.includes('Low')) return { color: colors.success, icon: 'check-circle' };
    return { color: colors.error, icon: 'error' };
  };

  const handleTradePress = (item: Package) => {
    console.log(item);
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        package_id: item.package_id,
      },
    });
  };

  const filteredServices = packages.map((pack) => ({
    ...pack,
    // profitPotential: '15-25% p.a.', // Dummy data
  })).filter((item) => item.categoryTag === selectedTag);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={"Trades"} showBuyProButton={true} />

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
              style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}
            >
              <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
                {/* Header Section */}
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText
                      style={[styles.cardTitle, { color: colors.vgreen }]}
                    >
                      {item.title}
                    </ThemedText>
                    {/* <FontAwesome name="check-circle" size={16} color={colors.success} style={{ marginLeft: 5 }} /> */}
                    <BadgeIndianRupeeIcon size={24} color={colors.success} style={{ marginLeft: 5 }} />
                    
                  </View>
                  <ThemedText type="subtitle" style={[styles.cardSubtitle]}>
                    Tradedge Package
                  </ThemedText>
                </View>

                {/* Details Section */}
                <View style={styles.cardDetails}>
                  <View style={styles.detailBox}>
                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                    <ThemedText type="subtitle" style={styles.detailLabel}>
                      Min Investment
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                      ₹ {new Intl.NumberFormat('en-IN').format(Number(item.minimumInvestment))}
                    </ThemedText>
                  </View>
                  <View style={styles.detailBox}>
                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                    <ThemedText type="subtitle" style={styles.detailLabel}>
                      Risk Category
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                      {item.riskCategory || 'N/A'}
                    </ThemedText>
                  </View>
                  <View style={styles.detailBox}>
                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                    <ThemedText type="subtitle" style={styles.detailLabel}>
                      Profit Potential
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                      {item.profitPotential || 'N/A'}
                    </ThemedText>
                  </View>
                </View>

                {/* Buttons Section */}
                <View style={styles.buttonRow}>
                  {/* Enquiry Button */}
                  <TouchableOpacity
                    style={[styles.enquiryButton, { backgroundColor: colors.text }]}
                    onPress={() => Linking.openURL('tel:7400330785')} // Open the phone dialer with the number
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="phone" size={14} color={colors.card} style={{ marginRight: 5 }} />
                    <ThemedText type="defaultSemiBold" style={[styles.buttonText, { color: colors.card }]}>
                      Enquiry
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Buy Button with Gradient */}
                  <TouchableOpacity
                    onPress={() => handleTradePress(item)}
                    style={{ flex: 1 }} // Ensure the entire button is clickable
                    activeOpacity={0.7} // Ensure the button click doesn't interfere with card click
                  >
                    <LinearGradient
                      colors={['#04810E', '#039D74']} // Gradient colors
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.buyButton]} // Apply gradient to the button
                    >
                      <ThemedText type="defaultSemiBold" style={[styles.buttonText, { color: colors.card }]}>
                        Buy
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
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
    // backgroundColor: 'red'
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
    color: 'grey',
    fontSize: 14,
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailBox: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingBottom: 6,
    alignItems: 'center',
  },
  detailIcon: {
    alignSelf: 'flex-end',
    marginRight: 2,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '300',
    marginBottom: 0,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enquiryButton: {
    flex: 1 / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  buyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
});