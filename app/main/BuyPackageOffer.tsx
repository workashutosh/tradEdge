import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@/utils/theme';
import { useStockContext } from '@/context/StockContext';

const { width } = Dimensions.get('window');

const OFFER_DURATION = 25 * 30; // 25 minutes in seconds

const latestOffers = [
  { id: 1, title: 'Get ₹25 OFF on your first month!', desc: 'Limited time offer for new users.' },
  { id: 2, title: 'Save ₹100 with TradEdge', desc: 'Apply coupon at checkout.' },
  { id: 3, title: 'Refer & Earn', desc: 'Invite friends and earn rewards.' },
];

export default function BuyPackageOffer() {
  const { package_id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useTheme();
  const { packages } = useStockContext();

  // Timer logic
  const [secondsLeft, setSecondsLeft] = useState(OFFER_DURATION);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Dropdown logic
  const [expanded, setExpanded] = useState([true, false, false]); // All open by default
  // State for selected package
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Group packages by category (for demo, split into 3 groups)
  const group1 = packages.filter((p, i) => i % 3 === 0);
  const group2 = packages.filter((p, i) => i % 3 === 1);
  const group3 = packages.filter((p, i) => i % 3 === 2);
  const groups = [
    { title: 'Stocks Only', data: group1 },
    { title: 'Stocks + Futures', data: group2 },
    { title: 'Stocks + Options', data: group3 },
  ];

  // Slider logic
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const sliderRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        let next = prev;
        let direction = slideDirection;
        if (slideDirection === 'left') {
          if (prev < latestOffers.length - 1) {
            next = prev + 1;
          } else {
            direction = 'right';
            next = prev - 1;
          }
        } else {
          if (prev > 0) {
            next = prev - 1;
          } else {
            direction = 'left';
            next = prev + 1;
          }
        }
        setSlideDirection(direction);
        sliderRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 2000); // Changed from 3500ms to 2000ms for faster sliding
    return () => clearInterval(interval);
  }, [slideDirection]);

  return (
    <ThemedView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Top Offers Slider */}
        <View style={{ marginTop: 24, marginBottom: 10 }}>
          {/* Back Arrow */}
          <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start', marginLeft: 16, marginBottom: 10, backgroundColor: '#FFF4E5', borderRadius: 20, padding: 4, elevation: 3 }}>
            <FontAwesome name="arrow-left" size={24} color="#FF9900" />
          </TouchableOpacity>
          <FlatList
            ref={sliderRef}
            data={latestOffers}
            horizontal
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingLeft: 72 }}
            renderItem={({ item }) => (
              <View style={{
                width: width - 72, // Full width minus back arrow
                justifyContent: 'center',
                marginRight: 16, // Add spacing between offers
              }}>
                <View style={{
                  backgroundColor: '#FFF4E5',
                  borderRadius: 16,
                  padding: 18,
                  width: '100%',
                  shadowColor: '#FFD699',
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}>
                  <Text style={{ color: '#FF9900', fontWeight: 'bold', fontSize: 17 }}>{item.title}</Text>
                  <Text style={{ color: '#333', fontSize: 14, marginTop: 4 }}>{item.desc}</Text>
                </View>
              </View>
            )}
          />
        </View>
        {/* Offer Banner */}
        <View style={{ backgroundColor: '#FFF4E5', padding: 18, alignItems: 'center', marginTop: 40, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, borderColor: '#FFD699', borderWidth: 1, marginHorizontal: 10 }}>
          <Text style={{ color: '#FF4D4F', fontWeight: 'bold', fontSize: 20 }}>EXTRA ₹25 OFF</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text style={{ color: '#333', fontWeight: '600', fontSize: 15 }}>Offer ends in </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4E5', borderRadius: 6 }}>
              <Text style={{ color: 'white', backgroundColor: '#FF4D4F', fontWeight: 'bold', fontSize: 16, paddingHorizontal: 8, borderRadius: 4 }}>{minutes.toString().padStart(2, '0')}</Text>
              <Text style={{ color: '#FF4D4F', fontWeight: 'bold', fontSize: 16, marginHorizontal: 2 }}>m</Text>
              <Text style={{ color: 'white', backgroundColor: '#FF4D4F', fontWeight: 'bold', fontSize: 16, paddingHorizontal: 8, borderRadius: 4 }}>{seconds.toString().padStart(2, '0')}</Text>
              <Text style={{ color: '#FF4D4F', fontWeight: 'bold', fontSize: 16, marginLeft: 2 }}>s</Text>
            </View>
          </View>
        </View>
        {/* Plan Groups as Dropdowns */}
        <View style={{ marginTop: 18, marginHorizontal: 10 }}>
          {groups.map((group, idx) => (
            <View key={group.title} style={{ marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => setExpanded(e => e.map((v, i) => i === idx ? !v : v))}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  borderRadius: 10,
                  backgroundColor: expanded[idx] ? '#FF9900' : colors.card,
                  marginBottom: 4,
                  elevation: 2,
                }}
              >
                <Text style={{ color: expanded[idx] ? 'white' : colors.text, fontWeight: 'bold', fontSize: 18 }}>{group.title}</Text>
                <FontAwesome name={expanded[idx] ? 'chevron-up' : 'chevron-down'} size={18} color={expanded[idx] ? 'white' : colors.text} />
              </TouchableOpacity>
              {expanded[idx] && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  {group.data.map((pack, pidx) => (
                    <TouchableOpacity
                      key={pack.package_id || pidx}
                      style={{
                        backgroundColor: selectedPackage?.package_id === pack.package_id ? '#FFF4E5' : colors.card,
                        borderColor: selectedPackage?.package_id === pack.package_id ? '#FF9900' : colors.border,
                        borderWidth: 2,
                        borderRadius: 16,
                        marginRight: 14,
                        padding: 18,
                        width: width * 0.45,
                        alignItems: 'center',
                        shadowColor: '#b3b3b3',
                        shadowOpacity: 0.13,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 3,
                      }}
                      activeOpacity={0.9}
                      onPress={() => setSelectedPackage(pack)}
                    >
                      <Text style={{ color: '#FF9900', fontWeight: 'bold', fontSize: 16 }}>{pack.title}</Text>
                      <Text style={{ color: selectedPackage?.package_id === pack.package_id ? '#000' : '#fff', fontWeight: 'bold', fontSize: 22, marginVertical: 4 }}>₹{pack.price}</Text>
                      <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{pack.details?.[0] || ''}</Text>
                      {idx === 0 && pidx === 0 && (
                        <Text style={{ color: '#FF9900', fontWeight: 'bold', fontSize: 12, marginTop: 6 }}>Best Value</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
        </View>
        {/* Multibagger Banner */}
        <View style={{ backgroundColor: '#FFF7CC', marginHorizontal: 10, marginTop: 8, borderRadius: 10, padding: 8, alignItems: 'center', flexDirection: 'row' }}>
          <FontAwesome name="star" size={16} color="#FF9900" style={{ marginRight: 6 }} />
          <Text style={{ color: '#FF9900', fontWeight: 'bold', fontSize: 14 }}>MULTIBAGGERS</Text>
          <Text style={{ color: '#333', fontSize: 13, marginLeft: 6 }}>stock included in 1 yr & loyalty plans</Text>
        </View>

        {/* Coupon/Savings Section */}
        <View style={{ backgroundColor: '#E6F9F0', marginHorizontal: 10, marginTop: 18, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="ticket" size={18} color="#00B386" style={{ marginRight: 8 }} />
            <Text style={{ color: '#00B386', fontWeight: 'bold', fontSize: 15 }}>₹100 saved with TradEdge</Text>
          </View>
          <Text style={{ color: '#00B386', fontWeight: 'bold', fontSize: 15 }}>Applied</Text>
        </View>
      </ScrollView>
      {/* Sticky Pay Button */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity
          style={{
            backgroundColor: selectedPackage ? '#FF9900' : '#ccc',
            paddingVertical: 16,
            borderRadius: 10,
            alignItems: 'center',
            opacity: selectedPackage ? 1 : 0.7,
          }}
          disabled={!selectedPackage}
          onPress={() => {
            if (selectedPackage) {
              router.push({ pathname: '/main/TradeDetails', params: { package_id: selectedPackage.package_id, redirectToHome: true } });
            }
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Pay ₹{selectedPackage ? selectedPackage.price : ''}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginTop: 4 }}>Cancel anytime • Billed every 1 month • Renews @ ₹899</Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 24,
    height:200,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: '#FF4D4F',
    color: 'white',
    minWidth: 40,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  packageScroll: {
    paddingLeft: 16,
    paddingBottom: 10,
  },
  packageCard: {
    width: width * 0.38,
    height: 120, // Reduced height for compact look
    marginRight: 14,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#b3b3b3',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  packageTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  packageDuration: {
    fontSize: 13,
    color: 'grey',
    textAlign: 'center',
  },
});
