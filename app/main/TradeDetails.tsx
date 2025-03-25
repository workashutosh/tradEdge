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
import { LinearGradient } from 'expo-linear-gradient';

interface Trade {
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  riskCategory: string;
  minimumInvestment?: string;
  profitPotential?: string;
}

export default function TradeDetails() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();

  const trade: Trade = {
    title: params.title as string,
    price: params.price as string,
    details: params.details ? JSON.parse(params.details as string) : [],
    categoryTag: params.categoryTag as string,
    icon: params.icon as string,
    riskCategory: params.riskCategory as string,
    minimumInvestment: params.minimumInvestment as string,
    profitPotential: params.profitPotential as string,
  };

  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    border: isDark ? '#333333' : '#e0e0e0',
    primary: '#00BCD4',
    buttonPrimary: '#00b300',
    success: '#00c853',
    warning: '#ffab00',
    error: '#ff4444',
    cardBackground: isDark ? '#1e1e1e' : '#ffffff',
    gradientStart: '#00b300',
    gradientEnd: '#00c853',
  };

  const getTagStyle = (riskCategory: string): { borderColor: string; icon: string } => {
    if (riskCategory.includes('Low')) return { borderColor: colors.success, icon: 'check-circle' };
    return { borderColor: colors.error, icon: 'error' };
  };

  const handleSubscribe = () => {
    // console.log(`Subscribed to ${trade.title}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.category, { color: colors.text }]}>{trade.categoryTag}</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CardHeader trade={trade} colors={colors} />
        <CardDetailsTable trade={trade} colors={colors} getTagStyle={getTagStyle} />
        {/* <DescriptionSection trade={trade} colors={colors} /> */}
        <PricingSection trade={trade} colors={colors} />
        <DetailsSection trade={trade} colors={colors} />
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <SubscribeButton colors={colors} onPress={handleSubscribe} />
      </View>
    </SafeAreaView>
  );
}

// Component Definitions

const CardHeader: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <LinearGradient
    colors={[colors.gradientStart, colors.gradientEnd]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.cardHeader}
  >
    <ThemedText style={[styles.title, { color: '#ffffff' }]}>{trade.title}</ThemedText>
    <MaterialIcons name={trade.icon} size={28} color="#ffffff" />
  </LinearGradient>
);

const CardDetailsTable: React.FC<{ trade: Trade; colors: any; getTagStyle: (tag: string) => { borderColor: string; icon: string } }> = ({ trade, colors, getTagStyle }) => (
  <View style={[styles.cardDetails, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
    <View style={styles.detailRow}>
      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Min Investment</ThemedText>
      <ThemedText style={[styles.detailValue, { color: colors.text }]}>
      ₹ {trade.minimumInvestment ? new Intl.NumberFormat('en-IN').format(Number(trade.minimumInvestment)) : 'N/A'}
      </ThemedText>
    </View>
    <View style={styles.detailRow}>
      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Risk Category</ThemedText>
      <View style={styles.riskTag}>
        <MaterialIcons
          name={getTagStyle(trade.riskCategory).icon}
          size={16}
          color={getTagStyle(trade.riskCategory).borderColor}
        />
        <ThemedText
          style={[styles.detailValue, { color: getTagStyle(trade.riskCategory).borderColor }]}
        >
          {trade.riskCategory || 'N/A'}
        </ThemedText>
      </View>
    </View>
    <View style={styles.detailRow}>
      <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Profit Potential</ThemedText>
      <ThemedText style={[styles.detailValue, { color: colors.success }]}>{trade.profitPotential || 'N/A'}</ThemedText>
    </View>
  </View>
);

const DescriptionSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Description</ThemedText>
    <ThemedText style={[styles.description, { color: colors.text }]}>
      {trade.details[0] || 'No description available'}
    </ThemedText>
  </View>
);

const PricingSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Pricing</ThemedText>
    <ThemedText style={[styles.price, { color: colors.text }]}>
      ₹ {trade.price ? new Intl.NumberFormat('en-IN').format(Number(trade.price)) : 'Contact for pricing'}
    </ThemedText>
  </View>
);

const DetailsSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>What we offer</ThemedText>
    {trade.details.map((detail, index) => (
      <View key={index} style={styles.detailItem}>
        <MaterialIcons name="check" size={16} color={colors.success} style={styles.checkIcon} />
        <ThemedText style={[styles.detailText, { color: colors.text }]}>{detail}</ThemedText>
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

  const stopWiggle = () => {
    if (wiggleAnimation.current) {
      wiggleAnimation.current.stop();
      wiggleAnimation.current = null;
    }
  };

  useEffect(() => {
    startWiggle();
    return () => stopWiggle();
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

  const glowOpacity = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [0.3, 0.8],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const maxX = buttonWidth - sliderWidth - padding * 2;
      const newX = Math.max(0, Math.min(gestureState.dx, maxX));
      pan.setValue(newX);
    },
    onPanResponderRelease: (_, gestureState) => {
      const threshold = buttonWidth - sliderWidth - padding * 2 - 10;
      const maxPosition = buttonWidth - sliderWidth - padding * 2;

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
          shadowColor: colors.buttonPrimary,
          shadowOpacity: glowOpacity,
          shadowRadius: 10,
          elevation: 8,
        },
      ]}
    >
      <View style={[styles.track, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
      <Animated.Text
        style={[
          styles.subscribeButtonText,
          {
            opacity: textOpacity,
            color: '#ffffff',
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          },
        ]}
      >
        Subscribe
      </Animated.Text>
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [{ translateX: pan }],
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: colors.buttonPrimary,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <MaterialIcons name="chevron-right" size={24} color={colors.buttonPrimary} style={styles.chevron} />
      </Animated.View>
    </Animated.View>
  );
};

// Styles
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  category: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  checkIcon: {
    marginRight: 12,
  },
  buttonContainer: {
    padding: 16,
    position: 'absolute',
    bottom: 10,
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  },
  chevron: {
    marginLeft: 4,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  riskTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});