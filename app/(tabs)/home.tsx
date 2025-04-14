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
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStockContext } from '@/context/StockContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BadgeCheck } from 'lucide-react-native';
import NseBseAccordian from '@/components/NseBseAccordian';
import MemoizedModal from '@/components/MemoizeModal';
import ExplorePackageCard from '@/components/home/explorePackageCard';
import TradeCard from '@/components/home/tradeCard';
import Header from '@/components/home/header';
import data from '@/data.json';
import KycComponent from '@/components/KycComponent';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { userDetails, isInitializing, isLoggedIn } = useAuth();
  const [username, setUsername] = useState('User');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isKYCComplete, setIsKYCComplete] = useState(false);
  const { NSEData, BSEData } = useStockContext();

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
  };

  useEffect(() => {
    const loadUsernameAndKYCStatus = async () => {
      try {
        if (userDetails) {
          // console.log('User Details from AuthContext:', userDetails);
          setUsername(userDetails.user_full_name || 'User'); // Changed to username
          // setIsKYCComplete(userDetails.auth === 'Y');
          setIsKYCComplete(userDetails.auth === "Y");
          return;
        }

        const storedDetails = await AsyncStorage.getItem('user_details');
        // console.log('User Details from AsyncStorage:', storedDetails);
        if (storedDetails) {
          const parsedDetails = JSON.parse(storedDetails);
          setUsername(parsedDetails.username || 'User'); // Changed to username
          setIsKYCComplete(parsedDetails.auth === 'Y');
        } else {
          // console.log('No user details found in AsyncStorage');
        }
      } catch (error) {
        // console.error('Error loading user details:', error);
      }
    };

    if (!isInitializing) {
      loadUsernameAndKYCStatus();
    }
  }, [userDetails, isInitializing]);

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

  if (isInitializing) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <ThemedText style={{ color: colors.text, marginTop: 10 }}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    router.replace('/otp');
    return null;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header username={username} colors={colors} setIsPopupVisible={setIsPopupVisible} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {!isKYCComplete &&
          <ThemedView style={{ marginHorizontal: 10, backgroundColor: 'transparent' }}>
            <KycComponent />
          </ThemedView>
        }
        <ThemedView style={[styles.websiteRedirectContainer, { shadowColor: colors.shadowColor }]}>
          <ThemedText style={{ fontSize: 15, color: 'white' }}>Your Trusted Research Analyst</ThemedText>
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
            Pay for Successful Research Calls
          </ThemedText>
          <ThemedText style={{ fontSize: 15, color: 'white' }}>
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
                <ThemedText style={styles.buttonText}>Start only with ₹ 1,999/-</ThemedText>
              </View>
            </TouchableOpacity>
            <Image style={styles.tradedgeLogo} source={require('@/assets/images/logoWhite.png')} />
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.explorePackagesContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>Explore Packages</ThemedText>
          <FlatList
            data={[...data.packagesItem, { isShowMore: true }]}
            renderItem={({ item }) => {
              if ('isShowMore' in item && item.isShowMore) {
                return (
                  <TouchableOpacity
                    style={styles.showMoreContainer}
                    onPress={() => router.replace('/(tabs)/trades')}
                  >
                    <ThemedText style={{ color: colors.text }}>See More</ThemedText>
                    <MaterialIcons name="arrow-forward" size={24} color={colors.text} />
                  </TouchableOpacity>
                );
              } else if (!('isShowMore' in item)) {
                return <ExplorePackageCard item={item} shimmerAnim={shimmerAnim} colors={colors} />;
              }
              return null;
            }}
            keyExtractor={(item, index) => ('title' in item ? item.title : `show-more-${index}`)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
          />
        </ThemedView>

        <LinearGradient
          colors={['rgb(28, 28, 28)', 'rgb(143, 234, 214)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 7, borderRadius: 10 }}
        >
          <ThemedView style={styles.bestTradesContainer}>
            <ThemedView style={styles.bestTradesSectionHeader}>
              <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 22 }}>
                Best Trades
              </ThemedText>
              <View style={{ flexDirection: 'row' }}>
                <BadgeCheck size={24} color="rgb(9, 196, 9)" style={{ marginRight: 3 }} />
                <ThemedText style={{ color: 'white', fontWeight: 'bold', alignSelf: 'center' }}>
                  SEBI Reg
                </ThemedText>
              </View>
            </ThemedView>
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {TradeCard({ item: data.tradesCards[0], colors, isDark })}
                {TradeCard({ item: data.tradesCards[1], colors, isDark })}
              </View>
              <View style={styles.gridRow}>
                {TradeCard({ item: data.tradesCards[2], colors, isDark })}
                {TradeCard({ item: data.tradesCards[3], colors, isDark })}
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
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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