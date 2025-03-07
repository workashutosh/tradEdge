import React, { useRef, useEffect } from 'react';
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
import { Animated, PanResponder } from 'react-native';

// Trade interface remains unchanged
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
  expectedReturn: string;
  riskLevel: string;
  duration: string;
  startDate: string;
  totalInvested: string;
  availableSlots: number;
  performanceMetrics: {
    pastYearReturn: string;
    volatility: string;
    successRate: string;
  };
  prerequisites: string[];
}

// Main Component (unchanged except for SubscribeButton usage)
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
    buttonPrimary: '#00b300',
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
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
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

      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <SubscribeButton colors={colors} onPress={handleSubscribe} />
      </View>
    </SafeAreaView>
  );
}

// Component Definitions (unchanged except SubscribeButton)
const CardHeader: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.cardHeader}>
    <ThemedText style={[styles.title, { color: colors.text }]}>{trade.title}</ThemedText>
    <MaterialIcons name={trade.icon} size={24} color={colors.text} />
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
    <ThemedText style={[styles.description, { color: colors.text }]}>
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
      <ThemedText style={[styles.minInvestment, { color: colors.text }]}>
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

const PerformanceSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
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

const PrerequisitesSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
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
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
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

const SubscribeButton: React.FC<{ colors: any; onPress: () => void }> = ({ colors, onPress }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const wiggleAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const buttonWidth = 280;
  const sliderWidth = 60;
  const padding = 5;

  // Start wiggle animation
  const startWiggle = () => {
    wiggleAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pan, {
          toValue: 10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pan, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    wiggleAnimation.current.start();
  };

  // Stop wiggle animation
  const stopWiggle = () => {
    if (wiggleAnimation.current) {
      wiggleAnimation.current.stop();
      wiggleAnimation.current = null;
    }
  };

  // Start wiggle on mount
  useEffect(() => {
    startWiggle();
    return () => stopWiggle(); // Cleanup on unmount
  }, []);

  const textOpacity = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backgroundColor = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [colors.buttonPrimary, '#99ff99'],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    
    onPanResponderMove: (_, gestureState) => {
      if (!buttonWidth || !sliderWidth || !padding) {
        console.warn('Required dimensions not defined');
        return;
      }
      const maxX = buttonWidth - sliderWidth - (padding * 2);
      const newX = Math.max(0, Math.min(gestureState.dx, maxX));
      pan.setValue(newX);
    },
    
    onPanResponderRelease: (_, gestureState) => {
      if (!buttonWidth || !sliderWidth || !padding || !onPress || !startWiggle) {
        console.warn('Required dependencies not defined');
        return;
      }
      const threshold = buttonWidth - sliderWidth - (padding * 2) - 10;
      const maxPosition = buttonWidth - sliderWidth - (padding * 2);
  
      if (gestureState.dx >= threshold) {
        Animated.spring(pan, {
          toValue: maxPosition,
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start(({ finished }) => {
          if (finished) {
            onPress();
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: true,
              friction: 7,
              tension: 40,
            }).start(({ finished }) => {
              if (finished) startWiggle();
            });
          }
        });
      } else {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start(({ finished }) => {
          if (finished) startWiggle();
        });
      }
    },
  });

  return (
    <Animated.View 
      style={[
        styles.subscribeButton, 
        { 
          backgroundColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }
      ]}
    >
      <View style={[styles.track, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
      <Animated.Text 
        style={[
          styles.subscribeButtonText, 
          { 
            opacity: textOpacity, 
            color: '#ffffff',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }
        ]}
      >
        Subscribe
      </Animated.Text>
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [{ translateX: pan }],
            backgroundColor: 'rgba(0, 0, 0, 0.11)', // Semi-transparent for pseudo-blur effect
            // shadowColor: '#000',
            // shadowOffset: { width: 0, height: 2 },
            // shadowOpacity: 0.4,
            // shadowRadius: 6,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle inset effect
          },
        ]}
        {...panResponder.panHandlers}
      >
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color="#ffffff" 
          style={styles.chevron} 
        />
      </Animated.View>
    </Animated.View>
  );
};

// Styles (unchanged)
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
  headerLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#eef1f5',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#2d2d2d',
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
    alignItems: 'center',
  },
  subscribeButton: {
    width: 280,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle inset effect
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  slider: {
    position: 'absolute',
    left: 5,
    width: 60,
    height: 40,
    top: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
    // elevation: 2,
  },
  chevron: {
    marginLeft: 4,
  },
});