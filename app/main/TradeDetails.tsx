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

interface Trade {
  title: string;        // From subtype_name or type_name
  price: string;        // Formatted price (e.g., "₹12000")
  details: string[];    // Array of details from API
  categoryTag: string;  // type_name from API
  icon: string;         // Icon based on category
  tags: string[];       // Two random tags
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
    tags: params.tags ? JSON.parse(params.tags as string) : [],
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
      <View style={[styles.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.category, { color: colors.primary }]}>{trade.categoryTag}</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CardHeader trade={trade} colors={colors} />
        <TagsSection trade={trade} colors={colors} getTagStyle={getTagStyle} />
        <DescriptionSection trade={trade} colors={colors} />
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
  <View style={[styles.cardHeader, { backgroundColor: colors.background }]}>
    <ThemedText style={[styles.title, { color: colors.text }]}>{trade.title}</ThemedText>
    <MaterialIcons name={trade.icon} size={24} color={colors.text} />
  </View>
);

const TagsSection: React.FC<{ trade: Trade; colors: any; getTagStyle: (tag: string) => { borderColor: string; icon: string } }> = ({ trade, colors, getTagStyle }) => (
  <View style={styles.section}>
    <View style={styles.tagsContainer}>
      {trade.tags.map((tag, index) => {
        const { borderColor, icon } = getTagStyle(tag);
        return (
          <View key={index} style={[styles.tagContainer, { borderColor }]}>
            <MaterialIcons name={icon} size={16} color={borderColor} style={styles.tagIcon} />
            <ThemedText style={[styles.tagText, { color: borderColor }]}>{tag}</ThemedText>
          </View>
        );
      })}
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
    <ThemedText style={[styles.price, { color: colors.primary }]}>{trade.price}</ThemedText>
  </View>
);

const DetailsSection: React.FC<{ trade: Trade; colors: any }> = ({ trade, colors }) => (
  <View style={styles.section}>
    <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Details</ThemedText>
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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const maxX = buttonWidth - sliderWidth - (padding * 2);
      const newX = Math.max(0, Math.min(gestureState.dx, maxX));
      pan.setValue(newX);
    },
    onPanResponderRelease: (_, gestureState) => {
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
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
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
            backgroundColor: 'rgba(0, 0, 0, 0.11)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
        {...panResponder.panHandlers}
      >
        <MaterialIcons name="chevron-right" size={24} color="#ffffff" style={styles.chevron} />
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    paddingVertical: 1,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkIcon: {
    marginRight: 8,
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
});