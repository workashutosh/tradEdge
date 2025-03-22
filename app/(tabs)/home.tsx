import { Image, StyleSheet, Animated, Platform, TouchableOpacity, useColorScheme, SafeAreaView, View, FlatList, ScrollView, Linking, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightIcon, BadgeCheck, Sparkles } from 'lucide-react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStockContext } from '@/context/StockContext';
import { Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NseBseAccordian from '@/components/NseBseAccordian';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [username, setUsername] = useState('User');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

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
    error: '#ff4444',
    primary: '#6200ee',
    success: '#00c853',
    warning: '#ffab00',
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7',
    shadowColor: isDark ? "rgb(128, 128, 128)" : "rgb(0, 0, 0)",
  };

  interface TradeCards {
    title: string;
    price: string;
    details: string[];
    categoryTag: string;
    icon: string;
    tags: string[];
  }

  interface PackagesItem {
    isShowMore?: boolean;
    title: string;
    price: string;
    details: string[];
    categoryTag: string;
    icon: string;
    tags: string[];
  }

  // get username
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('user_name');
        if (storedUsername) setUsername(storedUsername);
      } catch (error) {
        console.log('Error loading username:', error);
      }
    };
    loadUsername();
  }, []);

  const ExplorePackages: PackagesItem[] = [
    {
      title: 'Cash Intraday',
      price: '₹ 9,500',
      details: [
        'Intraday calls for cash market with daily recommendations.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Equity',
      icon: 'trending-up',
      tags: ['Moderate Risk', 'Avg ₹2,384/trade'],
    },
    {
      title: 'Index Futures',
      price: '₹ 9,000',
      details: [
        'NIFTY & BANKNIFTY futures with precise entries.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Future',
      icon: 'leaderboard',
      tags: ['Moderate Risk', 'Avg ₹4,299/trade'],
    },
    {
      title: 'Stock Options',
      price: '₹ 9,500',
      details: [
        'High-accuracy options trading calls.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Stock Option',
      icon: 'tune',
      tags: ['High Risk', 'Avg ₹3,524/trade'],
    },
    {
      title: 'Index Options',
      price: '₹ 9,000',
      details: [
        'Strategic trading for index options.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Option',
      icon: 'tune',
      tags: ['Moderate Risk', 'Avg ₹3,126/trade'],
    },
  ];
  
  const tradesCards: TradeCards[] = [
    {
      title: 'Cash Intraday',
      price: '₹ 9,500',
      details: [
        'Intraday calls for cash market with daily recommendations.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Equity',
      icon: 'trending-up',
      tags: ['Moderate Risk', 'Avg ₹2,384/trade'],
    },
    {
      title: 'Index Futures',
      price: '₹ 9,000',
      details: [
        'NIFTY & BANKNIFTY futures with precise entries.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Future',
      icon: 'leaderboard',
      tags: ['Moderate Risk', 'Avg ₹4,299/trade'],
    },
    {
      title: 'Index Options',
      price: '₹ 9,000',
      details: [
        'Strategic trading for index options.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Index Option',
      icon: 'tune',
      tags: ['Moderate Risk', 'Avg ₹3,126/trade'],
    },
    {
      title: 'Stock Options',
      price: '₹ 9,500',
      details: [
        'High-accuracy options trading calls.',
        'Get 1 Tip per day',
        'Profit approx. ₹5,000 to ₹9,000 Per Lot',
        'Customer Service Support from 9 AM to 6 PM',
        'Tips with Proper Stop Loss & Target',
        'Trading calls via WhatsApp, SMS, and emails',
      ],
      categoryTag: 'Stock Option',
      icon: 'tune',
      tags: ['High Risk', 'Avg ₹3,524/trade'],
    },
  ];

  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
    return () => scaleValue.stopAnimation();
  }, [scaleValue]);

  const handleTradePress = (item: TradeCards) => {
    router.push({
      pathname: '/main/TradeDetails',
      params: {
        title: item.title,
        price: item.price,
        details: JSON.stringify(item.details),
        categoryTag: item.categoryTag,
        icon: item.icon,
        tags: JSON.stringify(item.tags),
      },
    });
  };
  
  // Explore Packages component
  const renderExplorePackagesItem = ({ item }: { item: PackagesItem }) => (
    <ThemedView style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}>
      <TouchableOpacity onPress={()=>handleTradePress(item)}>
        <ThemedView style={styles.cardHeader}>
          <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
          <MaterialIcons style={styles.cardIcon} name={item.icon} size={26} color={'green'} />
        </ThemedView>
        <ThemedView style={styles.cardBody}>
          <ThemedText>{item.details[0]}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.cardFooter}>
          <View style={[styles.cardDivider, { backgroundColor: 'grey' }]} />
          <ThemedView style={[{borderColor: 'green', borderWidth: 2, borderRadius: 5,}]}>
            <ThemedText style={styles.cardPrice}>{item.price}</ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
  
  // Trades cards component
  const rendertradesCard = ({ item }: { item: TradeCards }) => (
    <ThemedView style={[styles.tradeCardContainer, { shadowColor: colors.shadowColor }]}>
      <TouchableOpacity onPress={()=>handleTradePress(item)}>
        <ThemedView style={[styles.tradeCardHeader, {}]}>
          <ThemedText style={[styles.tradeCardTitle, ]}>{item.title}</ThemedText>
          <MaterialIcons style={styles.cardIcon} name={item.icon} size={26} color={colors.text} />
        </ThemedView>
        <ThemedView style={styles.cardBody}>
          <ThemedText style={[{ fontSize: 15, lineHeight: 18, color: 'grey' }]}>{item.details[0]}</ThemedText>
        </ThemedView>
        {/* <ThemedView style={styles.cardFooter}> */}
          {/* <View style={[styles.cardDivider, { backgroundColor: colors.buttonPrimary }]} /> */}
          <ThemedText style={[styles.cardPrice, {alignSelf: 'flex-end'}]}>{item.price}</ThemedText>
        {/* </ThemedView> */}
      </TouchableOpacity>
    </ThemedView>
  );


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {overlayVisible && (
        <View style={[styles.overlay, { zIndex: overlayVisible ? 10 : -1 }]}>
          <View style={[{ }]}>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header]}>
        <ThemedView style={[styles.profileContainer, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
            <FontAwesome name="user-circle-o" size={28} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.greetingText, { color: colors.text }]}>
            Hi, {username}
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.buyProButtonContainer, { shadowColor: colors.shadowColor }]}>
          <TouchableOpacity
            style={[styles.buyProButton, { backgroundColor: colors.buttonBackground, borderColor: colors.warning }]}
            onPress={() => {
              setIsPopupVisible(true);
              setOverlayVisible(!overlayVisible);
            }}
          >
            <Animated.View style={[styles.starContainer, { transform: [{ scale: scaleValue }] }]}>
              <Sparkles size={16} color={colors.warning} fill={colors.warning} style={styles.starIcon} />
            </Animated.View>
            <ThemedText style={[styles.buyProButtonText, { color: colors.warning }]}>Buy Pro</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>

      {/* body */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Website redirection */}
        <ThemedView style={[styles.websiteRedirectContainer, { shadowColor: colors.shadowColor }]}>
          <ThemedText style={{ fontSize: 15, color: "white" }}>Your Trusted Research Analyst</ThemedText>
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: "white" }}>
            Pay for Successful Research Calls
          </ThemedText>
          <ThemedText style={{ fontSize: 15, color: "white" }}>Start your wealth creation journey!</ThemedText>
          <ThemedView style={styles.websiteRedirectContainerBottom}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://twmresearchalert.com')}
              style={[styles.redirectionButton, { }]}
            >
              <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Start only with 1999/-</ThemedText>
            </TouchableOpacity>
            <Image style={styles.tradedgeLogo} source={require('@/assets/images/logo.png')} />
          </ThemedView>
        </ThemedView>

        {/* Explore packages */}
        <ThemedView style={[styles.explorePackagesContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>Explore Packages</ThemedText>
          <FlatList
          data={[...ExplorePackages, { isShowMore: true }]}
            renderItem={({ item }) => {
            if (item.isShowMore) {
              return (
                <TouchableOpacity
                  style={styles.showMoreContainer}
                  onPress={() => router.replace('/(tabs)/trades')}
                >
                  <ThemedText style={{ color: colors.text }}>See More</ThemedText>
                  <Ionicons
                    name={'chevron-forward'}
                    size={24}
                    color={isDark?'white':'black'}
                  />
                </TouchableOpacity>
              );
            }
            if ('title' in item) {
                return renderExplorePackagesItem({ item });
            }
            return null;
          }}
          keyExtractor={(item, index) => 'title' in item ? item.title : `show-more-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardList}
        />
        </ThemedView>

        {/* Accordian */}
        <View style={[{marginHorizontal: 7}]}>
          <NseBseAccordian/>
        </View>

        {/* best trades container */}
        <LinearGradient colors={['rgb(28, 28, 28)', 'rgb(143, 234, 214)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 7, borderRadius: 10 }}>
          <ThemedView style={[styles.bestTradesContainer, {  }]}>
            <ThemedView style={[styles.bestTradesSectionHeader, {}]}>
              <ThemedText style={[{ color: 'white', fontWeight: '600', fontSize: 22,  }]}>Best Trades</ThemedText>
              <View style={[{flexDirection: 'row'}]}>
                <BadgeCheck size={24} color={'rgb(9, 196, 9)'} style={[{marginRight: 3}]}/>
                <ThemedText style={[{ color: 'white', fontWeight: 'bold', alignSelf: 'center' }]}>SEBI Reg</ThemedText>
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

        <ThemedView style={[{ backgroundColor: colors.background, paddingBottom: 70 }]}></ThemedView>
      </ScrollView>

      <Modal
        visible={isPopupVisible}
        onRequestClose={() => {
          setIsPopupVisible(false);
          setOverlayVisible(!overlayVisible);
        }}
        animationType='slide'
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ height: Dimensions.get('window').height * 0.7, width: '100%' }}>
            <ThemedView style={{ flex: 1, borderRadius: 20, padding: 20 }}>
              <ThemedText>Modal</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setIsPopupVisible(false);
                  setOverlayVisible(!overlayVisible);
                }}
                style={[{ backgroundColor: colors.buttonBackground, alignSelf: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 }]}
              >
                <ThemedText style={[{ color: colors.buttonText, fontSize: 20 }]}>Close</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
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
  buyProButtonContainer: {
    borderRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  buyProButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    height: 30,
    gap: 6,
  },
  buyProButtonText: {
    textAlignVertical: 'top',
    fontSize: 16,
    fontWeight: '600',
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    alignSelf: 'center',
  },
  container: {
    flex: 1,
  },
  websiteRedirectContainer: {
    marginHorizontal: 10,
    marginTop: 15,
    paddingVertical: 30,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "rgb(30, 106, 0)",
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
  redirectionButton: {
    backgroundColor: 'rgb(44, 145, 5)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  sectionContainer: {
    paddingTop: 5,
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
  cardList: {
    paddingBottom: 10,
  },
  cardContainer: {
    height: 210,
    width: 250,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderColor: 'green',
    marginHorizontal: 8,
    borderWidth: 1,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tradeCardContainer: {
    height: 170,
    width: '48%',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderWidth: 0.5,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  tradeCardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderColor: 'grey', 
    paddingBottom: 5, 
    height: 30
  },
  cardHeader: {
    height: '20%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBody: {
    height: '60%',
    justifyContent: 'center',
  },
  cardFooter: {
    height: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  tradeCardTitle: {
    fontWeight: '700',
    fontSize: 15,
    width: '85%',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 20,
    width: '85%',
  },
  cardIcon: {
    width: '15%',
  },
  cardDivider: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    marginRight: 10,
    alignSelf: 'center',
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: '700',
    top: -2,
    padding: 5,
    color: 'green',
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'left',
  },
  explorePackagesContainer: {
    paddingVertical: 10,
  },
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