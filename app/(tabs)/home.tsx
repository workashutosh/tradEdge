import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Animated,
  SafeAreaView,
  View,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BadgeCheck } from 'lucide-react-native';
import NseBseAccordian from '@/components/NseBseAccordian';
import MemoizedModal from '@/components/MemoizeModal';
import ExplorePackageCard from '@/components/home/explorePackageCard';
import TradeCard from '@/components/home/tradeCard';
import Header from '@/components/Header';
import data from '@/data.json';
import KycComponent from '@/components/KycComponent';
import { useStockContext } from '@/context/StockContext';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/utils/theme';
import { WebView } from 'react-native-webview'; // Import WebView

export default function HomeScreen() {
  const userContext = useUser();

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { NSEData, BSEData, packages } = useStockContext(); // Get packages from StockContext

  const explorePackagesId = ["7", "3", "10", "9"];
  const bestTradesId = ["2", "4", "11", "9"];

  const insets = useSafeAreaInsets();
  const colors = useTheme();

  // Filter packages for Explore Packages and Best Trades
  const explorePackages = packages.filter((pkg) =>
    explorePackagesId.includes(pkg.package_id)
  );

  const bestTrades = packages.filter((pkg) =>
    bestTradesId.includes(pkg.package_id)
  );

  const refundOfferPackage = packages.find(pkg => pkg.package_id === "1")
  console.log(refundOfferPackage);


  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 300,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const handleCloseModal = useCallback(() => {
    setIsPopupVisible(false);
  }, []);

  if (userContext.isInitializing) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <ThemedText style={{ color: colors.text, marginTop: 10 }}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!userContext.isLoggedIn) {
    router.replace('/otp');
    return null;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={"Hi " + (userContext.userDetails?.user_full_name || "User")} showBuyProButton={true} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* TradingView Widget */}
        <ThemedView style={{ marginHorizontal: 10, marginTop: 10, backgroundColor: 'transparent' }}>
          <WebView
            style={{ height: 300, borderRadius: 10, overflow: 'hidden' }}
            source={{
              html: `
                <!-- TradingView Widget BEGIN -->
                <div class="tradingview-widget-container">
                  <div class="tradingview-widget-container__widget"></div>
                  <div class="tradingview-widget-copyright">
                    <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
                      <span class="blue-text">Track all markets on TradingView</span>
                    </a>
                  </div>
                  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-tickers.js" async>
                  {
                    "symbols": [
                      {
                        "proName": "FX_IDC:EURUSD",
                        "title": "EUR to USD"
                      },
                      {
                        "proName": "BITSTAMP:BTCUSD",
                        "title": "Bitcoin"
                      },
                      {
                        "proName": "BITSTAMP:ETHUSD",
                        "title": "Ethereum"
                      },
                      {
                        "description": "Tesla",
                        "proName": "NASDAQ:TSLA"
                      }
                    ],
                    "isTransparent": false,
                    "showSymbolLogo": true,
                    "colorTheme": "dark",
                    "locale": "en"
                  }
                  </script>
                </div>
                <!-- TradingView Widget END -->
              `,
            }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </ThemedView>

        {/* KYC Component */}
        {userContext.userDetails && (userContext.userDetails.auth === null || userContext.userDetails.auth === 'N') && (
          <ThemedView style={{ marginHorizontal: 10, backgroundColor: 'transparent' }}>
            <KycComponent />
          </ThemedView>
        )}

        <ThemedView style={{ marginHorizontal: 10, marginTop: 0, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            onPress={() => {
              router.push({
                  pathname: '/main/TradeDetails',
                  params: {
                    package_id: "10000",
                  },
                });
              }}
            style={[styles.refundOfferCard]}
          >
            <ImageBackground
              source={require('@/assets/images/refundframe1.png')} // Replace with your image path
              style={styles.refundOfferImageBackground}
              imageStyle={{ borderRadius: 10, objectFit: 'cover' }} // Ensures the image respects the card's border radius
            >
              <View style={{height: 200}}></View>
            </ImageBackground>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.websiteRedirectContainer, { shadowColor: colors.shadowColor }]}>
          <ThemedText type="subtitle" style={{ fontSize: 15, color: 'white' }}>
            Your Trusted Research Analyst
          </ThemedText>
          <ThemedText type="title" style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
            Pay for Successful Research Calls
          </ThemedText>
          <ThemedText type="default" style={{ fontSize: 15, color: 'white' }}>
            Start your wealth creation journey!
          </ThemedText>
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
                <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                  Explore
                </ThemedText>
              </View>
            </TouchableOpacity>
            <Image style={styles.tradedgeLogo} source={require('@/assets/images/logoWhite.png')} />
          </ThemedView>
        </ThemedView>


        {/* Explore Packages Section */}
        <ThemedView style={[styles.explorePackagesContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText type="title" style={[styles.sectionHeader, { color: colors.text }]}>Explore Packages</ThemedText>
          <FlatList
            data={[...explorePackages, { isShowMore: true }]} // Use filtered explorePackages
            renderItem={({ item }) => {
              if ('isShowMore' in item && item.isShowMore) {
                return (
                  <TouchableOpacity
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

        {/* Best Trades Section */}
        <LinearGradient
          colors={['rgb(28, 28, 28)', 'rgb(143, 234, 214)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 7, borderRadius: 10 }}
        >
          <ThemedView style={styles.bestTradesContainer}>
            <ThemedView style={styles.bestTradesSectionHeader}>
              <ThemedText type="title" style={{ color: 'white', fontWeight: '600', fontSize: 22 }}>
                Best Trades
              </ThemedText>
              <View style={{ flexDirection: 'row' }}>
                <BadgeCheck size={24} color="rgb(9, 196, 9)" style={{ marginRight: 3 }} />
                <ThemedText type="defaultSemiBold" style={{ color: 'white', fontWeight: 'bold', alignSelf: 'center' }}>
                  SEBI Reg
                </ThemedText>
              </View>
            </ThemedView>
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {bestTrades[0] && <TradeCard item={bestTrades[0]} />}
                {bestTrades[1] && <TradeCard item={bestTrades[1]} />}
              </View>
              <View style={styles.gridRow}>
                {bestTrades[2] && <TradeCard item={bestTrades[2]} />}
                {bestTrades[3] && <TradeCard item={bestTrades[3]} />}
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
  safeArea: {
    flex: 1,
    // backgroundColor: 'red',
  },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  websiteRedirectContainer: {
    marginHorizontal: 10,
    marginTop: 10,
    paddingVertical: 25,
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
  refundOfferCard: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  refundOfferGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  refundOfferHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  refundOfferTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  refundOfferSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  refundOfferImageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
});