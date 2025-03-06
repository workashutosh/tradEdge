import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, router } from 'expo-router';

// Updated Interface for Trade data with more fields
interface Trade {
  title: string;
  desc: string;
  traders: string;
  tags: string[];
  credits: string;
  minInvestment: string;
  icon: string;
  category: string;
  additionalInfo: string[];
  // New fields
  expectedReturn: string;        // e.g., "8-12% annually"
  riskLevel: string;            // e.g., "Moderate"
  duration: string;             // e.g., "6-12 months"
  startDate: string;            // e.g., "2025-03-01"
  totalInvested: string;        // e.g., "$250,000"
  availableSlots: number;       // e.g., 15
  performanceMetrics: {
    pastYearReturn: string;     // e.g., "10.5%"
    volatility: string;         // e.g., "Medium"
    successRate: string;        // e.g., "85%"
  };
  prerequisites: string[];      // e.g., ["Verified Account", "Minimum $1000 balance"]
}

// Main Component
export default function TradeDetails() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();

  const trade: Trade = {
    title: params.title as string,
    desc: params.desc as string,
    traders: params.traders as string,
    tags: JSON.parse(params.tags as string),
    credits: params.credits as string,
    minInvestment: params.minInvestment as string,
    icon: params.icon as string,
    category: params.category as string,
    additionalInfo: params.additionalInfo ? JSON.parse(params.additionalInfo as string) : [],
    // Default values for new fields
    expectedReturn: params.expectedReturn as string || "8-12% annually",
    riskLevel: params.riskLevel as string || "Moderate",
    duration: params.duration as string || "6-12 months",
    startDate: params.startDate as string || "2025-03-01",
    totalInvested: params.totalInvested as string || "$250,000",
    availableSlots: Number(params.availableSlots) || 15,
    performanceMetrics: params.performanceMetrics 
      ? JSON.parse(params.performanceMetrics as string) 
      : { pastYearReturn: "10.5%", volatility: "Medium", successRate: "85%" },
    prerequisites: params.prerequisites 
      ? JSON.parse(params.prerequisites as string) 
      : ["Verified Account", "Minimum $1000 balance"],
  };

  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    border: isDark ? '#333333' : '#e0e0e0',
    error: '#ff4444',
    primary: '#00BCD4',
    buttonPrimary: '#6200ee',
    success: '#00c853',
    warning: '#ffab00',
  };

  const getTagStyle = (tag: string): { borderColor: string; icon: string } => {
    if (tag.includes('Low Risk')) return { borderColor: colors.success, icon: 'check-circle' };
    if (tag.includes('Moderate Risk')) return { borderColor: colors.warning, icon: 'warning' };
    if (tag.includes('High Risk')) return { borderColor: colors.error, icon: 'error' };
    if (tag.includes('Avg')) return { borderColor: colors.primary, icon: 'trending-up' };
    return { borderColor: colors.primary, icon: 'info' };
  };

  const handleSubscribe = () => {
    console.log(`Subscribed to ${trade.title}`);
    // Add subscription logic here
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.category, { color: colors.primary }]}>{trade.category}</ThemedText>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <CardHeader trade={trade} colors={colors} />
        <RiskReturnSection trade={trade} colors={colors} getTagStyle={getTagStyle} />
        <DescriptionSection trade={trade} colors={colors} />
        <PricingSection trade={trade} colors={colors} />
        <PerformanceSection trade={trade} colors={colors} />
        <PrerequisitesSection trade={trade} colors={colors} />
        <AdditionalInfoSection trade={trade} colors={colors} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <SubscribeButton colors={colors} onPress={handleSubscribe} />
      </View>
    </SafeAreaView>
  );
}

// Components (unchanged ones omitted for brevity)
const CardHeader: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.cardHeader}>
    <ThemedText style={[styles.title, { color: colors.buttonPrimary }]}>{trade.title}</ThemedText>
    <MaterialIcons name={trade.icon} size={24} color={colors.buttonPrimary} />
  </View>
);

const RiskReturnSection: React.FC<{ trade: Trade; colors: any; getTagStyle: (tag: string) => { borderColor: string; icon: string } }> = ({ trade, colors, getTagStyle }) => (
  <View style={styles.section}>
    <View style={styles.tagsContainer}>
      {trade.tags.map((tag, index) => {
        const { borderColor, icon } = getTagStyle(tag);
        return (
          <View key={index} style={[styles.tagContainer, { borderColor, borderWidth: 2 }]}>
            <MaterialIcons name={icon} size={16} color={borderColor} style={styles.tagIcon} />
            <ThemedText style={[styles.tagText, { color: borderColor }]}>{tag}</ThemedText>
          </View>
        );
      })}
    </View>
    <ThemedText style={[styles.detailText, { color: colors.text }]}>
      Expected Return: {trade.expectedReturn}
    </ThemedText>
    <ThemedText style={[styles.detailText, { color: colors.text }]}>
      Risk Level: {trade.riskLevel}
    </ThemedText>
  </View>
);

const DescriptionSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.description, { color: 'grey' }]}>
      {`${trade.desc}\n${trade.traders}`}
    </ThemedText>
    <ThemedText style={[styles.detailText, { color: colors.text }]}>
      Duration: {trade.duration}
    </ThemedText>
    <ThemedText style={[styles.detailText, { color: colors.text }]}>
      Start Date: {trade.startDate}
    </ThemedText>
  </View>
);

const PricingSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <View style={styles.priceContainer}>
      <ThemedText style={[styles.minInvestment, { color: colors.buttonPrimary }]}>
        Min. Investment: {trade.minInvestment}
      </ThemedText>
      <ThemedText style={[styles.detailText, { color: colors.text }]}>
        Total Invested: {trade.totalInvested}
      </ThemedText>
      <ThemedText style={[styles.detailText, { color: colors.text }]}>
        Available Slots: {trade.availableSlots}
      </ThemedText>
    </View>
  </View>
);

// New Performance Section
const PerformanceSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
      Performance Metrics
    </ThemedText>
    <ThemedText style={[styles.detailText, { color: colors.text }]}>
      Past Year Return: {trade.performanceMetrics.pastYearReturn}
    </ThemedText>
    <ThemedText style={[styles.detailText, { color: colors.text }]}>
      Volatility: {trade.performanceMetrics.volatility}
    </ThemedText>
    <ThemedText style={[styles.detailText, { color: colors.text }]}>
      Success Rate: {trade.performanceMetrics.successRate}
    </ThemedText>
  </View>
);

// New Prerequisites Section
const PrerequisitesSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
      Prerequisites
    </ThemedText>
    {trade.prerequisites.map((prereq, index) => (
      <View key={index} style={styles.additionalInfoItem}>
        <MaterialIcons name="check" size={16} color={colors.success} style={styles.checkIcon} />
        <ThemedText style={[styles.additionalInfoText, { color: colors.text }]}>
          {prereq}
        </ThemedText>
      </View>
    ))}
  </View>
);

const AdditionalInfoSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
      Additional Information
    </ThemedText>
    {trade.additionalInfo.map((info, index) => (
      <View key={index} style={styles.additionalInfoItem}>
        <MaterialIcons name="check" size={16} color={colors.success} style={styles.checkIcon} />
        <ThemedText style={[styles.additionalInfoText, { color: colors.text }]}>
          {info}
        </ThemedText>
      </View>
    ))}
  </View>
);

const SubscribeButton: React.FC<{ colors: any; onPress: () => void }> = ({ colors, onPress }) => (
  <TouchableOpacity
    style={[styles.subscribeButton, { backgroundColor: colors.buttonPrimary }]}
    onPress={onPress}
  >
    <ThemedText style={styles.subscribeButtonText}>Subscribe Now</ThemedText>
  </TouchableOpacity>
);

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  priceContainer: {
    gap: 8,
  },
  minInvestment: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  additionalInfoContainer: {
    marginTop: 4,
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
  buttonContainer: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  subscribeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});