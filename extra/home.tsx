import { Image, StyleSheet, Animated, TouchableOpacity, useColorScheme, SafeAreaView, View, FlatList, ScrollView, Linking, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BadgeCheck, Check } from 'lucide-react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStockContext } from '@/context/StockContext';
import { LinearGradient } from 'expo-linear-gradient';
import NseBseAccordian from '@/components/NseBseAccordian';
import BuyProButton from '@/components/BuyProButton';
import MemoizedModal from '@/components/MemoizeModal';
import CircleAnimation from '@/animation/CircleAnimation';
import CircleBackgroundView from '@/animation/CircleAnimation';
import ExplorePackageCard from '@/components/ExplorePackageCard';

export default function HomeScreen() {
  const [username, setUsername] = useState('User');
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const { NSEData, BSEData, updateNSEData, updateBSEData } = useStockContext();

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  const colors = {
    background: isDark ? '#121212' : '#f5f7fa',
    headerBackground: isDark ? '#1e1e1e' : '#ffffff',
    headerBorderBottom: isDark ? '#2d2d2d' : '#eef1f5',
    text: isDark ? '#ffffff' : '#333333',
    buttonBackground: isDark ? '#ffffff' : '#000000',
    buttonText: isDark ? '#000000' : '#ffffff',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    shadowColor: isDark ? 'rgb(128, 128, 128)' : 'rgb(0, 0, 0)',
    vgreen: 'rgb(0, 128, 0)',
  };

  interface TradeCards {
    title: string;
    price: string;
    details: string[];
    categoryTag: string;
    icon: string;
    riskCategory: string;
    minimumInvestment: string;
    profitPotential: string;
  }

  interface PackagesItem {
    isShowMore?: boolean;
    title: string;
    price: string;
    details: string[];
    categoryTag: string;
    icon: string;
    riskCategory: string;
    minimumInvestment: string;
    profitPotential: string;
  }

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('user_name');
        if (storedUsername) setUsername(storedUsername);
      } catch (error) {
        // console.log('Error loading username:', error);
      }
    };
    loadUsername();
  }, []);

  const ExplorePackages: PackagesItem[] = [
    {
      title: 'Equity Basic',
      price: '12000',
      details: ["Get 1 Intraday tip on a daily basis","Approx. 16 - 18 Calls in a month","Tips with Proper Stop Loss & Target","Live Market Customer Support Available","Trading calls via WhatsApp, SMS, and Emails"],
      categoryTag: 'Equity',
      minimumInvestment: "50000",
      riskCategory: "Low",
      icon: 'trending-up',
      profitPotential: '15-25% p.a.',
    },
    {
      title: 'Stock Option Basic',
      price: '22500',
      details: ["Profit approx. ₹5,000 to ₹9,000 Per Lot","Get 1 Tip per day","Customer Service Support from 9 AM to 6 PM","Tips with Proper Stop Loss & Target","Trading calls via WhatsApp, SMS, and Emails"],
      categoryTag: 'Stock Option',
      minimumInvestment: "300000",
      riskCategory: "Low",
      icon: 'leaderboard',
      profitPotential: '15-25% p.a.',
    },
    {
      title: 'Stock Future Pro',
      price: '45500',
      details: ["Profit Target ₹4,000 ₹ ₹6,000 Approx","1 Tip Per Day","Complementary Short-term and BTST Trades","Tips with Proper Stop Loss & Target","Trading calls via WhatsApp, SMS, and Emails"],
      categoryTag: 'Stock Future',
      minimumInvestment: "300000",
      riskCategory: "Low",
      icon: 'tune',
      profitPotential: '15-25% p.a.',
    },
    {
      title: 'Index Options Pro',
      price: '35000',
      details: ["Trading calls via WhatsApp, SMS, and Emails","1 Tip Per Day","Required Investment ₹1,00,000","Profit approx. ₹8,000 to ₹10,000 per trade","Tips with Proper Stop Loss & Target"],
      categoryTag: 'Index Option',
      minimumInvestment: "50000",
      riskCategory: "Low",
      icon: 'tune',
      profitPotential: '15-25% p.a.',
    },
  ];

  const tradesCards: TradeCards[] = [
    {
      title: 'Equity Pro',
      price: '35000',
      details: ["Get 1 to 2 Intraday tips on a daily basis","Complementary BTST and Short Term","Expiry Special alerts every weekly expiry","Live Market Customer Support Available","Trading calls via WhatsApp, SMS, and Emails"],
      categoryTag: 'Equity',
      minimumInvestment: "50000",
      riskCategory: "Low",
      icon: 'trending-up',
      profitPotential: '15-25% p.a.',
    },
    {
      title: 'Stock Option Pro',
      price: '22500',
      details: ["Profit approx. ₹5,000 to ₹9,000 Per Lot","Get 1 Tip per day","Profit approx. ₹5,000 to ₹9,000 Per Lot","Customer Service Support from 9 AM to 6 PM","Tips with Proper Stop Loss & Target","Trading calls via WhatsApp, SMS, and Emails"],
      categoryTag: 'Stock Option',
      minimumInvestment: "300000",
      riskCategory: "Low",
      icon: 'leaderboard',
      profitPotential: '15-25% p.a.',
    },
    {
      title: 'Stock Future Pro',
      price: '45500',
      details: ["Complementary Short-term and BTST Trades","1 Tip Per Day","Profit Target ₹4,000 ₹ ₹6,000 Approx","Tips with Proper Stop Loss & Target","Trading calls via WhatsApp, SMS, and Emails"],
      categoryTag: 'Stock Future',
      minimumInvestment: "300000",
      riskCategory: "Low",
      icon: 'tune',
      profitPotential: '15-25% p.a.',
    },
    {
      title: 'Index Options Classic',
      price: '18000',
      details: ["1 Tip Per Day","Required Investment ₹30,000","Profit approx. ₹2,000 to ₹4,000 per trade","Trading calls via WhatsApp, SMS, and Emails"],
      categoryTag: 'Index Option',
      minimumInvestment: "50000",
      riskCategory: "Low",
      icon: 'tune',
      profitPotential: '15-25% p.a.',
    },
  ];

  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    // Define the animation
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 300,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Start the animation
    animation.start();

    // Cleanup: Stop the animation when the component unmounts
    return () => {
      animation.stop();
    };
  }, [shimmerAnim]); // Dependency array still includes shimmerAnim

  const handleTradePress = (item: TradeCards) => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        title: item.title,
        price: item.price,
        details: JSON.stringify(item.details),
        categoryTag: item.categoryTag,
        icon: item.icon,
        riskCategory: item.riskCategory,
        minimumInvestment: item.minimumInvestment,
        profitPotential: item.profitPotential,
      },
    });
  };

  const renderExplorePackagesItem = ({ item }: { item: PackagesItem }) => (
    <ThemedView style={[
      styles.cardContainer,
      {
        shadowColor: colors.shadowColor,
        borderColor: isDark ? '#00FF2A' : '#04810E',
        borderWidth: 2,
        backgroundColor: isDark ? '#181c18' : '#f5f7fa',
      },
    ]}>
      <TouchableOpacity onPress={() => handleTradePress(item)} style={{ flex: 1 }}>
        <ThemedView style={[styles.cardHeader, { borderBottomWidth: 1, borderColor: isDark ? '#00FF2A' : '#04810E' }]}> 
          <ThemedText style={[styles.cardTitle, { color: isDark ? '#00FF2A' : '#04810E' }]}>{item.title}</ThemedText>
          <MaterialIcons style={styles.cardIcon} name={item.icon} size={22} color={isDark ? '#00FF2A' : '#04810E'} />
        </ThemedView>
        <ThemedView style={styles.cardBody}>
          <ThemedText style={{ color: colors.text }}>{item.details[0]}</ThemedText>
          <View style={{ flexDirection: 'row', gap: 3, paddingTop: 8 }}>
            <Check color={isDark ? '#00FF2A' : '#04810E'} size={20} />
            <ThemedText style={{ color: isDark ? '#00FF2A' : '#04810E', fontWeight: 'bold' }}>Daily calls</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: 3, paddingBottom: 8 }}>
            <Check color={isDark ? '#00FF2A' : '#04810E'} size={20} />
            <ThemedText style={{ color: isDark ? '#00FF2A' : '#04810E', fontWeight: 'bold' }}>Profit margin 80%</ThemedText>
          </View>
        </ThemedView>
        <ThemedView style={{
          backgroundColor: isDark ? 'rgba(0,255,42,0.12)' : 'rgba(4,129,14,0.12)',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          alignItems: 'center',
          paddingVertical: 10,
          marginTop: 'auto',
        }}>
          <ThemedText style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: isDark ? '#00FF2A' : '#04810E',
            backgroundColor: isDark ? '#232d23' : '#e6f5e6',
            borderRadius: 8,
            paddingHorizontal: 18,
            paddingVertical: 4,
            overflow: 'hidden',
          }}>
            ₹ {item.price ? new Intl.NumberFormat('en-IN').format(Number(item.price)) : 'N/A'}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );

  const rendertradesCard = ({ item }: { item: TradeCards }) => (
    <ThemedView style={[styles.tradeCardContainer, { shadowColor: colors.shadowColor, backgroundColor: 'rgb(180, 180, 180)' }]}>
      <TouchableOpacity onPress={() => handleTradePress(item)}>
        <ThemedView style={[styles.tradeCardHeader, {}]}>
          <ThemedText style={[styles.tradeCardTitle, {color: 'black'}]}>{item.title}</ThemedText>
          <MaterialIcons style={[styles.cardIcon, {color: 'black'}]} name={item.icon} size={26} color={colors.text} />
        </ThemedView>
        <CircleBackgroundView
          size={400}
          colors={isDark?['rgb(0, 0, 0)', 'rgb(46, 46, 46)']:['rgb(0, 0, 0)', 'rgb(46, 46, 46)']}
          duration={2000}
          delay={400}
          ringCount={1} // Match the image's ring count
          style={{
            height: '81%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgb(69, 69, 69)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <ThemedText
            style={[
              styles.cardDiscountedPrice,
              {
                alignSelf: 'center',
                justifyContent: 'center',
                backgroundColor: 'green',
                color: 'black',
                borderRadius: 10,
                marginVertical: '18%',
                textAlignVertical: 'center',
              },
            ]}
          >
            ₹ {item.price ? new Intl.NumberFormat('en-IN').format(Number(item.price)) : 'N/A'}/-
          </ThemedText>
          <View>
            <LinearGradient
              colors={['rgb(255, 171, 0)', 'rgb(239, 159, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderWidth: 1,
                borderColor: 'black',
                paddingHorizontal: 15,
                paddingVertical: 5,
                borderRadius: 20,
                alignSelf: 'center',
              }}
            >
              <ThemedText style={{ fontWeight: '600' }}>Subscribe</ThemedText>
            </LinearGradient>
          </View>
        </CircleBackgroundView>
      </TouchableOpacity>
    </ThemedView>
  );

  const handleCloseModal = useCallback(() => {
    setIsPopupVisible(false);
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedView style={[styles.profileContainer, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
            <FontAwesome name="user-circle-o" size={28} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.greetingText, { color: colors.text }]}>
            Hi, {username}
          </ThemedText>
        </ThemedView>
        <BuyProButton setIsPopupVisible={setIsPopupVisible} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.websiteRedirectContainer, { shadowColor: colors.shadowColor }]}>
          <ThemedText style={{ fontSize: 15, color: 'white' }}>Your Trusted Research Analyst</ThemedText>
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
            Pay for Successful Research Calls
          </ThemedText>
          <ThemedText style={{ fontSize: 15, color: 'white' }}>Start your wealth creation journey!</ThemedText>
          <ThemedView style={styles.websiteRedirectContainerBottom}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/trades')}
              style={styles.buttonContainer}
            >
              <View style={styles.redirectionButton}>
                <Animated.View
                  style={[
                    styles.shimmer,
                    { transform: [{ translateX: shimmerAnim }, { rotate: '35deg' }] },
                  ]}
                />
                <ThemedText style={styles.buttonText}>Start only with ₹ 1,999/-</ThemedText>
              </View>
            </TouchableOpacity>
            <Image style={styles.tradedgeLogo} source={require('@/assets/images/logoWhite.png')} />
          </ThemedView>
        </ThemedView>

        {/* Explore Packages Section */}
        <ThemedView style={[
          styles.explorePackagesContainer,
          {
            backgroundColor: colors.vgreen + '22', // subtle green tint overlay (with alpha)
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.vgreen,
            marginHorizontal: 8,
            paddingVertical: 16,
            marginBottom: 10,
          },
        ]}> 
          <ThemedText type="title" style={[styles.sectionHeader, { color: colors.text }]}>Explore Packages</ThemedText>
          <FlatList
            data={[...ExplorePackages, { isShowMore: true }]}
            renderItem={({ item }) => {
              if ('isShowMore' in item && item.isShowMore) {
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.showMoreContainer}
                    onPress={() => router.replace('/(tabs)/trades')}
                  >
                    <ThemedText type="link" style={{ color: colors.text }}>See More</ThemedText>
                    <MaterialIcons name="arrow-forward" size={24} color={colors.text} />
                  </TouchableOpacity>
                );
              } else if (!('isShowMore' in item)) {
                return (
                  <ExplorePackageCard
                    item={item}
                    shimmerAnim={shimmerAnim}
                    colors={colors}
                  />
                );
              }
              return null;
            }}
            keyExtractor={(item, index) => ('title' in item ? item.title : `show-more-${index}`)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
          />
        </ThemedView>

        <View style={{ marginHorizontal: 7 }}>
          <NseBseAccordian />
        </View>

        <LinearGradient
          colors={['rgb(28, 28, 28)', 'rgb(143, 234, 214)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 7, borderRadius: 10 }}
        >
          <ThemedView style={styles.bestTradesContainer}>
            <ThemedView style={styles.bestTradesSectionHeader}>
              <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 22 }}>Best Trades</ThemedText>
              <View style={{ flexDirection: 'row' }}>
                <BadgeCheck size={24} color="rgb(9, 196, 9)" style={{ marginRight: 3 }} />
                <ThemedText style={{ color: 'white', fontWeight: 'bold', alignSelf: 'center' }}>SEBI Reg</ThemedText>
              </View>
            </ThemedView>
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {rendertradesCard({ item: tradesCards[0] })}
                {rendertradesCard({ item: tradesCards[1] })}
              </View>
              <View style={styles.gridRow}>
                {rendertradesCard({ item: tradesCards[2] })}
                {rendertradesCard({ item: tradesCards[3] })}
              </View>
            </View>
          </ThemedView>
        </LinearGradient>

        <ThemedView style={{ backgroundColor: colors.background, paddingBottom: 70 }} />
      </ScrollView>

      <MemoizedModal isVisible={isPopupVisible} onClose={handleCloseModal} colors={colors} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    zIndex: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: { flex: 1 },
  websiteRedirectContainer: {
    marginHorizontal: 10,
    marginTop: 15,
    paddingVertical: 30,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'rgb(30, 106, 0)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  websiteRedirectContainerBottom: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: 6,
  },
  redirectionButton: {
    backgroundColor: 'rgb(44, 145, 5)',
    paddingHorizontal: 18,
    borderRadius: 6,
    shadowColor: 'rgb(44, 145, 5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    paddingVertical: 10,
  },
  shimmer: {
    position: 'absolute',
    width: 15,
    height: '200%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.7,
  },
  tradedgeLogo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 8,
  },
  bestTradesSectionHeader: {
    marginBottom: 12,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  cardList: { paddingBottom: 10 },
  tradeCardContainer: {
    height: 180,
    width: '48%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  tradeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderBottomWidth: 2,
    backgroundColor: 'transparent',
    borderColor: 'grey',
    paddingBottom: 5,
    height: 30,
  },
  cardContainer: {
    height: 210,
    width: 250,
    borderColor: 'green',
    marginHorizontal: 8,
    borderWidth: 1,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  cardBody: {
    height: '55%',
    justifyContent: 'center',
    paddingHorizontal: 10,
    overflow: 'hidden',
    // backgroundColor: 'red',
  },
  cardFooter: {
    height: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgb(30, 106, 0)',
    overflow: 'hidden',
  },
  tradeCardTitle: {
    fontWeight: '700',
    fontSize: 15,
    width: '85%',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 18,
    width: '85%',
  },
  cardIcon: { width: '15%' },
  cardPrice: {
    fontSize: 20,
    fontWeight: '700',
    padding: 5,
    color: 'green',
  },
  cardDiscountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    padding: 5,
    color: 'green',
  },
  explorePackagesContainer: { paddingVertical: 10 },
  bestTradesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  gridContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  showMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: '100%',
    marginRight: 10,
    gap: 5,
  },
});