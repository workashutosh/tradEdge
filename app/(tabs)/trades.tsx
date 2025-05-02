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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useStockContext } from '@/context/StockContext';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useTheme } from '@/utils/theme';

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
            <ThemedView key={idx} style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}>
              <TouchableOpacity onPress={() => handleTradePress(item)}>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                  <View style={[styles.cardHeader, { borderBottomColor: colors.text }]}>
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
                  </View>
                  <View style={[styles.cardDetails, { borderBottomColor: colors.text }]}>
                    <View style={[styles.detailRow, { borderRightWidth: 1, borderRightColor: colors.text }]}>
                      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Min Investment</ThemedText>
                      <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                        ₹{' '}
                        {item.minimumInvestment
                          ? new Intl.NumberFormat('en-IN').format(Number(item.minimumInvestment))
                          : 'N/A'}
                      </ThemedText>
                    </View>
                    <View style={[styles.detailRow, { borderRightWidth: 1, borderRightColor: colors.text }]}>
                      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Risk Category</ThemedText>
                      <View style={styles.riskTag}>
                        <MaterialIcons
                          name={getTagStyle(item.riskCategory).icon}
                          size={14}
                          color={getTagStyle(item.riskCategory).color}
                        />
                        <ThemedText
                          style={[
                            styles.detailValue,
                            { color: getTagStyle(item.riskCategory).color },
                          ]}
                        >
                          {item.riskCategory}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Profit Potential</ThemedText>
                      <ThemedText style={[styles.detailValue, { color: colors.text }]}>{item.profitPotential}</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.buttonRow, { borderTopColor: colors.text }]}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.buttonPrimary }]}
                      onPress={() => handleTradePress(item)}
                    >
                      <ThemedText style={styles.actionButtonText}>Enquire</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.buttonPrimary }]}
                      onPress={() => handleTradePress(item)}
                    >
                      <ThemedText style={styles.actionButtonText}>Buy</ThemedText>
                    </TouchableOpacity>
                  </View>
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
    marginHorizontal: 6,
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
    marginBottom: 8,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    // borderBottomWidth: 1,
    marginBottom: 8,
  },
  detailRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 8,
    // paddingBottom: 8,

  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    // flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionButtonText: {
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