import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import SliderButton from '@/components/SliderButton';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Trade {
  package_id: string;
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  riskCategory: string;
  minimumInvestment?: string;
  profitPotential?: string;
}

const getISTDate = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 19).replace('T', ' ');
};

export default function TradeDetails() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();
  const { userDetails, isInitializing, isLoggedIn } = useAuth();

  const [isRedirecting, setIsRedirecting] = useState(false);
  

  const trade: Trade = {
    package_id: params.package_id as string,
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

  const handlePayment = async () => {
    console.log(trade);
    const transaction_id = `TXN_${Date.now()}`;
    const payment_date = getISTDate();

    // if(userDetails?.auth!=="Y"){
    //   alert("Please complete KYC to proceed buying package.");
    //   router.replace('/(tabs)/home')
    //   return;
    // }
    
    try {

      await AsyncStorage.setItem('transactionDetails', JSON.stringify({
        package_id: trade.package_id,
        user_id: userDetails?.user_id,
        amount: trade.price,
        payment_date: payment_date,
        transaction_id: transaction_id,
      }));

      setIsRedirecting(true);
      const result=await axios.post('https://tradedge-server.onrender.com/api/paymentURL', {
      // const result=await axios.post('http://192.168.1.40:5000/api/paymentURL', {
        // user_whatsapp_number: userDetails?.user_whatsapp_number,
        // redirectUrl: "http://192.168.1.40:5000/api/paymentResponse"
        // redirectUrl: "tradedge://paymentResult?status=SUCCESS&txnId=TXN12345",
        redirectUrl: `tradedge://paymentResult`,
        // redirectUrl: `exp://192.168.1.40:8081/--/paymentResult`,
        amount: Number(trade.price),
        user_id: userDetails?.user_id,
        package_id: trade.package_id,
        transaction_id: transaction_id,
        payment_date: payment_date,
      });
      const response=result.data;
      // console.log("Payment URL response:", response);
      console.log("✔️  Payment URL generated");
      const paymentUrl = response.redirectUrl; // Adjust based on your API response structure
      // console.log("Payment URL:", paymentUrl);

      Linking.openURL(paymentUrl).catch((err) => {
        console.error('Error opening URL:', err);
        alert('Failed to open the URL. Please try again later.');
      });
      
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error opening URL:', error.message);
      } else {
        console.error('Error opening URL:', error);
      }
      console.error('Full Axios error:', (error as any).toJSON?.() || error);
      alert('Failed to open the URL. Please try again later.');
    } finally {
      setIsRedirecting(false);
    }
  };


  if (isRedirecting) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={[styles.category, { color: colors.text }]}>Redirecting...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

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
        <PricingSection trade={trade} colors={colors} />
        <DetailsSection trade={trade} colors={colors} />
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <SliderButton
          name="Subscribe"
          colors={colors}
          onPress={handlePayment}
        />
      </View>
    </SafeAreaView>
  );
}

// Component Definitions (unchanged)
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
      <ThemedText style={[styles.detailValue, { color: colors.text }]}>{trade.profitPotential || 'N/A'}</ThemedText>
    </View>
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
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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