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

type ServiceItem = {
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    primary: '#00BCD4',
    buttonPrimary: 'rgb(44, 145, 5)',
    shadowColor: isDark ? 'white' : 'black',
    selectedTagBackground: isDark? 'white':'black',
    tagBackground: isDark ? '#333333' : '#e0e0e0',
    success: '#00c853',
    warning: '#ffab00',
    error: '#ff4444',
    buttonSecondary: '#00BCD4', // For the "Enquire" button
  };

  const { services, loading } = useStockContext();

  const uniqueTags = [...new Set(services.map((service) => service.categoryTag))] as string[];
  const tags = uniqueTags.length > 0 ? uniqueTags : [''];
  const [selectedTag, setSelectedTag] = useState<string>(tags[0]);


  const getTagStyle = (riskCategory: string): { color: string; icon: string } => {
    if (riskCategory.includes('Low')) return { color: colors.success, icon: 'check-circle' };
    return { color: colors.error, icon: 'error' };
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
        minimumInvestment: item.minimumInvestment || 'N/A',
        riskCategory: item.riskCategory || 'N/A',
        profitPotential: item.profitPotential || 'N/A',
      },
    });
  };

  const filteredServices = services.map((service) => ({
    ...service,
    // Adding dummy data for fields not present in the original ServiceItem
    // minimumInvestment: '₹10,000', // Dummy data
    profitPotential: '15-25% p.a.', // Dummy data
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
                    { color: selectedTag === tag ? isDark ? 'black' : 'white' : isDark ? '#cccccc' : '#666666' },
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
                  {/* Card Header (Name) */}
                  <View style={[styles.cardHeader, {borderBottomColor: colors.text}]}>
                    {/* <MaterialIcons name={item.icon} size={24} color={colors.buttonPrimary} /> */}
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
                  </View>

                  {/* Card Details (Minimum Investment, Risk Category, Profit Potential) */}
                  <View style={[styles.cardDetails, {borderBottomColor: colors.text}]}>
                    <View style={[styles.detailRow, {borderRightWidth: 1, borderRightColor: colors.text}]}>
                      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>
                        Min Investment
                      </ThemedText>
                      <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                      ₹ {item.minimumInvestment ? new Intl.NumberFormat('en-IN').format(Number(item.minimumInvestment)) : 'N/A'}
                      </ThemedText>
                    </View>
                    <View style={[styles.detailRow, {borderRightWidth: 1, borderRightColor: colors.text}]}>
                      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>
                        Risk Category
                      </ThemedText>
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
                      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>
                        Profit Potential
                      </ThemedText>
                      <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                        {item.profitPotential}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Buttons (Enquire and Buy) */}
                  <View style={[styles.buttonRow, {borderTopColor: colors.text}]}>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagScroll: {
    flexDirection: 'row',
    paddingHorizontal: 10,
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