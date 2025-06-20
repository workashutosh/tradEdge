import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  SafeAreaView,
  View,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Button,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BadgeCheck } from 'lucide-react-native';
import MemoizedModal from '@/components/MemoizeModal';
import ExplorePackageCard from '@/components/home/explorePackageCard';
import TradeCard from '@/components/home/tradeCard';
import Header from '@/components/Header';
import KycComponent from '@/components/KycComponent';
import { useStockContext } from '@/context/StockContext';
import { useUser } from '@/context/UserContext';
import { useTheme, ThemeHookReturn } from '@/utils/theme';
import { registerForPushNotificationsAsync } from '@/components/pushNotification';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // show banner
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const userContext = useUser();
  const [expoToken, setExpoToken] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { NSEData, BSEData, packages } = useStockContext();
  const insets = useSafeAreaInsets();
  const colors: ThemeHookReturn = useTheme();

  const explorePackagesId = ["5", "3", "10", "9"];
  const bestTradesId = ["2", "4", "11", "9"];

  const explorePackages = packages.filter((pkg) =>
    explorePackagesId.includes(pkg.package_id)
  );
  const bestTrades = packages.filter((pkg) =>
    bestTradesId.includes(pkg.package_id)
  );
  const refundOfferPackage = packages.find(pkg => pkg.package_id === "10000");

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

  // ✅ Push notification setup and send to Native Notify
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log("Expo Push Token:", token);
          setExpoToken(token);

          // Send token to Native Notify
          await fetch('https://app.nativenotify.com/api/expo-push-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              appId: 30641,
              appToken: '8bDCRIV79EOfNyW7zDEkMd',
              expoPushToken: token,
              subID: userContext.userDetails?.user_id || 'guest',
            }),
          });
        }
      } catch (error) {
        console.error("Push notification setup error:", error);
      }
    };

    initPushNotifications();
  }, []);

  // ✅ Test push notification button handler
  const sendTestNotification = async () => {
    if (!expoToken) return;
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: expoToken,
          sound: 'default',
          title: '🚀 Test Notification',
          body: 'This is a test push sent from HomeScreen!',
        }),
      });
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  };


useEffect(() => {
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    console.log("Notification response received");

    if (data?.screen === 'TradeDetailedCard' && data.tradeTip) {
      const tip = data.tradeTip;
      const prediction = tip?.prediction;

      if (prediction) {
        router.push({
          pathname: '/tradeDetailedCard/[package_id]',
          params: {
            ...tip,
            package_id: tip.package_id,
            confidence: prediction.confidence,
            potentialProfit: prediction.potentialProfit,
            potentialLoss: prediction.potentialLoss,
            predictionType: prediction.type,
          },
        });
      } else {
        console.warn("Prediction is undefined in tradeTip:", tip);
      }
    }
  };

  const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      handleNotificationResponse(response);
      console.log("Handled last notification response async");
    }
  }).catch(err => {
    console.error("Error getting last notification response:", err);
  });

  return () => {
    subscription.remove();
  };
}, []);

useEffect(() => {
  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (Device.osName === 'Android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  setupNotifications();
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
        {userContext.userDetails && (userContext.userDetails.auth === null || userContext.userDetails.auth === 'N') && (
          <ThemedView style={{ marginHorizontal: 8 }}>
            <KycComponent />
          </ThemedView>
        )}

        <ThemedView style={{ marginHorizontal: 10, marginTop: 6, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: '/main/TradeDetails',
                params: { package_id: "10000" },
              });
            }}
            style={[styles.refundOfferCard]}
          >
            <ImageBackground
              source={require('@/assets/images/refundframe1.png')}
              style={styles.refundOfferImageBackground}
              imageStyle={{ borderRadius: 10, objectFit: 'cover' }}
            >
              <View style={{ height: 200 }}></View>
            </ImageBackground>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.websiteRedirectContainer, { shadowColor: colors.shadowColor, backgroundColor: colors.vgreen }]}>
          <ThemedText type="subtitle" style={{ fontSize: 15, color: colors.text }}>
            Your Trusted Research Analyst
          </ThemedText>
          <ThemedText type="title" style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
            Pay for Successful Research Calls
          </ThemedText>
          <ThemedText type="default" style={{ fontSize: 15, color: colors.text }}>
            Start your wealth creation journey!
          </ThemedText>
          <ThemedView style={styles.websiteRedirectContainerBottom}>
            <TouchableOpacity
              activeOpacity={0.7}
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

        {/* Explore Packages */}
        <ThemedView style={[styles.explorePackagesContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText type="title" style={[styles.sectionHeader, { color: colors.text }]}>Explore Packages</ThemedText>
          <FlatList
            data={[...explorePackages, { isShowMore: true }]}
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
              } else {
                return (
                  <ExplorePackageCard
                    item={item}
                    shimmerAnim={shimmerAnim}
                    colors={{
                      ...colors,
                      card: colors.card,
                      border: colors.border,
                      priceBackground: colors.success,
                      priceText: '#fff',
                    }}
                  />
                );
              }
            }}
            keyExtractor={(item, index) => ('title' in item ? item.title : `show-more-${index}`)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
          />
        </ThemedView>

        {/* Best Trades */}
        <LinearGradient
          colors={['rgba(1, 47, 7, 0.78)', 'rgb(143, 234, 214)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 7, borderRadius: 10 }}
        >
          <ThemedView style={styles.bestTradesContainer}>
            <ThemedView style={styles.bestTradesSectionHeader}>
              <ThemedText type="title" style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 22 }}>
                Best Trades
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <BadgeCheck size={24} color={colors.success} />
                <ThemedText type="defaultSemiBold" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
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
    backgroundColor: '#388E3C', // Modern green
    paddingHorizontal: 18,
    borderRadius: 6,
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // White text for contrast
    fontWeight: 'bold',
    fontSize: 16,
    paddingVertical: 10,
  },
  shimmer: {
    position: 'absolute',
    width: 15,
    height: '200%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle shimmer
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
  explorePackagesContainer: {
    paddingVertical: 10,
    // backgroundColor handled inline based on theme
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
    backgroundColor: '#4CAF50', // Green gradient
  },
  refundOfferHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0F2F1', // Light teal text
  },
  refundOfferTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginTop: 5,
  },
  refundOfferSubtitle: {
    fontSize: 14,
    color: '#E0F2F1', // Light teal text
    marginTop: 5,
  },
  refundOfferImageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
});