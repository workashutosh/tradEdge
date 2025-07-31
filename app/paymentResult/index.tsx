import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/UserContext';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/utils/theme';
import LottieView from 'lottie-react-native';
import { useStockContext } from '@/context/StockContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Trade {
  type_id: string;
  type_name: string;
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

const formatIndianRupee = (amount: number) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

const getISTDate = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 19).replace('T', ' ');
};


const PaymentResultScreen = () => {
  
  const colors=useTheme();
  const { getUserTransactions }=useUser();
  const {userDetails} = useUser();
  const [transaction_id, setTransactionId] = useState<string | null>(null);
  const [package_id, setPackageId] = useState<string | null>(null);
  const [user_id, setUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [payment_date, setPaymentDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [transactionDetails, setTransactionDetails] = useState<{
    package_id?: string;
    user_id?: string;
    amount?: string;
    payment_status?: string;
    payment_date?: string;
    transaction_id?: string;
    payment_method?: string;
  } | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [dbUpdateError, setDbUpdateError] = useState<string | null>(null);
  const { package_id: queryPackageId } = useLocalSearchParams(); // Rename to avoid conflict
  const userEmail = userDetails?.user_email_id;
  const userName = userDetails?.user_full_name;

  

  useEffect(() => {
    if (queryPackageId) {
      setPackageId(queryPackageId.toString()); // Convert to string if needed
    }
  }, [queryPackageId]);
      

  useEffect(() => {
    const fetchFromStorage = async () => {
      try {
        const storedTransactionDetails = await AsyncStorage.getItem('transactionDetails');
        if (storedTransactionDetails) {
          const parsedDetails = JSON.parse(storedTransactionDetails);
          setTransactionId(parsedDetails.transaction_id || null);
          setPackageId(parsedDetails.package_id || null);
          setUserId(parsedDetails.user_id || null);
          setAmount(parsedDetails.amount || null);
          setPaymentDate(parsedDetails.payment_date || null);
        }
      } catch (error) {
        console.error('Error fetching transaction details from AsyncStorage:', (error as Error).message);
      }
    };

    fetchFromStorage();
  }, []);

useEffect(() => {
  const fetchPaymentStatus = async () => {
    if (!transaction_id) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://tradedge-server.onrender.com/api/paymentStatus`, {
        params: { transaction_id },
      });

      const paymentData = response.data.status || {};
      const paymentState = paymentData.state || 'FAILURE';
      const paymentDetails = paymentData.paymentDetails?.[0] || {};

      setStatus(paymentState === 'COMPLETED' ? 'SUCCESS' : 'FAILURE');
      setTransactionDetails({
        transaction_id: paymentDetails.transactionId,
        payment_method: paymentDetails.paymentMode,
        amount: paymentDetails.amount,
      });

      const updatedTransactionDetails = {
        transaction_id: paymentDetails.transactionId || transaction_id,
        package_id,
        user_id,
        amount: paymentDetails.amount || amount,
        payment_status: paymentState,
        payment_date: payment_date || getISTDate(),
        payment_method: paymentDetails.paymentMode || 'PHONEPE',
      };

      await AsyncStorage.setItem('transactionDetails', JSON.stringify(updatedTransactionDetails));
      await updateDB(paymentState, paymentDetails.paymentMode);
      await getUserTransactions(user_id);

      //  Send confirmation email if payment successful
      if (
        paymentState === 'COMPLETED' &&
        package_id &&
        userDetails?.user_email_id &&
        userDetails?.user_full_name
      ) {
        const packageData = await fetchPackageDetails(package_id);
        if (packageData) {
          await sendConfirmationEmail({
            email: userDetails.user_email_id,
            name: userDetails.user_full_name,
            transaction_id: paymentDetails.transactionId || transaction_id,
            payment_method: paymentDetails.paymentMode || 'PHONEPE',
            amount: Number(paymentDetails.amount || amount),
            packageDetails: packageData,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching payment status:', (error as Error).message);
      setStatus('FAILURE');
    } finally {
      setLoading(false);
    }
  };

  fetchPaymentStatus();
}, [transaction_id]);



  const updateDB = async (paymentState: string, payment_method: string) => {
    try {
      setDbUpdateError(null); // Reset error before trying
      const updateStatusResponse = await axios.post(`https://tradedge-server.onrender.com/api/addPaymentindb`, {
      // const updateStatusResponse = await axios.post(`http://192.168.1.40:5000/api/addPaymentindb`, {
        package_id: package_id,
        user_id: user_id,
        amount: amount,
        payment_status: paymentState,
        payment_date: payment_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
        transaction_id: transaction_id,
        payment_method: payment_method || 'PHONEPE',
      });
      console.log('Payment status updated in DB:', updateStatusResponse.data);
    } catch (error: any) {
      let errorMsg = 'Error updating payment status index:';
      if (error.response) {
        errorMsg += ` ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMsg += ' No response received from server.';
      } else {
        errorMsg += ` ${error.message}`;
      }
      setDbUpdateError(errorMsg);
      console.error(errorMsg);
    }
  };

  useEffect(() => {
    if (status === 'SUCCESS') {
      setShowAnimation(true);
      setAnimationKey(prev => prev + 1); // To restart animation if needed
      const timer = setTimeout(() => setShowAnimation(false), 3500); // Show for 3.5s
      return () => clearTimeout(timer);
    }
  }, [status]);

 const fetchPackageDetails = async (id: string) => {
  const url = `https://gateway.twmresearchalert.com/package?package_id=${id}`;
  console.log(" Fetching package from URL:", url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `6WeFqncZXmLCo2V0/NaWIQ==`, // Replace with real token
      },
    });

    const packageData = response?.data?.data;

    //  Add selected subtype explicitly for backend PHP script
    if (packageData?.subtypes?.length > 0) {
      packageData.subtype = packageData.subtypes[0]; // 👈 Key step
    }

    return packageData;
  } catch (error: any) {
    console.error(' Failed to fetch package details:', error?.response?.status, error?.message);
    return null;
  }
};

const sendConfirmationEmail = async ({
  email,
  name,
  transaction_id,
  payment_method,
  amount,
  packageDetails,
}: {
  email: string;
  name: string;
  transaction_id: string;
  payment_method: string;
  amount: number;
  packageDetails: any;
}) => {
  try {
    const response = await axios.post('http://gateway.twmresearchalert.com?url=sendpackagemail', {
      email,
      name,
      transaction_id,
      payment_method,
      amount,
      packageDetails, //  This now includes .subtype
    });

    console.log('📧 Full response:', response.data);

    if (response.data.success) {
      console.log(' Confirmation email sent');
    } else {
      console.warn('Email not sent:', response.data.message || 'No message returned from backend');
    }
  } catch (error) {
    console.error(' Error sending confirmation email:', error);
  }
};





  if (loading || status === null) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.detailsText, { color: colors.text }]}>Fetching payment status...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
      {/* Confetti animation at the very top, always reserving space */}
      <View style={styles.confettiFixedHeightWrapper}>
        {showAnimation && (
          <View style={styles.confettiContainer}>
            <LottieView
              key={animationKey}
              source={require('@/assets/images/confetti-burst.json')}
              autoPlay
              loop={false}
              style={{ width: 320, height: 180 }}
            />
          </View>
        )}
      </View>
      <ThemedText type="defaultSemiBold" style={{ fontSize: 22, color: colors.success, textAlign: 'center', marginBottom: 16, marginTop: 8 }}>
        Transaction Successful!
      </ThemedText>
      {/* Center the result card below the confetti, with enough margin */}
      <View style={[styles.resultCardWrapper, { marginTop: showAnimation ? 0 : 40 }]}> 
        <Animated.View
          entering={status === 'SUCCESS' ? SlideInUp.duration(500) : FadeIn.duration(500)}
          exiting={status === 'SUCCESS' ? SlideOutDown.duration(500) : FadeOut.duration(500)}
          style={[
            styles.resultContainer,
            status === 'SUCCESS'
              ? { backgroundColor: colors.success, borderColor: colors.vgreen }
              : { backgroundColor: colors.error + '22', borderColor: colors.error },
          ]}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.resultText,
              { color: status === 'SUCCESS' ? colors.vgreen : colors.error },
            ]}
          >
            {status === 'SUCCESS' ? 'Payment Successful!' : 'Payment Failed'}
          </ThemedText>
          {status === 'SUCCESS' ? (
            <>
              <ThemedText type="default" style={[styles.detailsText, { color: 'black' }]}>
                Transaction ID: <ThemedText style={styles.boldText}>{transactionDetails?.transaction_id}</ThemedText>
              </ThemedText>
              <ThemedText type="default" style={[styles.detailsText, { color: 'black' }]}>
                Payment Mode: <ThemedText style={styles.boldText}>{transactionDetails?.payment_method}</ThemedText>
              </ThemedText>
              <ThemedText type="default" style={[styles.detailsText, { color: 'black' }]}>
                Amount: <ThemedText style={styles.boldText}>{transactionDetails?.amount ? formatIndianRupee(Number(transactionDetails.amount) / 100) : 'N/A'}</ThemedText>
              </ThemedText>
            </>
          ) : (
            <ThemedText type="default" style={[styles.detailsText, { color: colors.text }]}>Please try again.</ThemedText>
          )}
          {dbUpdateError && (
            <ThemedText type="default" style={{ color: colors.error, marginTop: 12, textAlign: 'center' }}>
              {dbUpdateError}
            </ThemedText>
          )}
        </Animated.View>
      </View>
      <ThemedView style={{ marginTop: 32, alignItems: 'center' }}>
        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.goHome,
            {
              color: colors.text,
              backgroundColor: colors.tagBackground,
              borderColor: colors.text,
            },
          ]}
          onPress={() => router.replace('/(tabs)/home')}
        >
          Go Home
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resultContainer: {
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    width: 320,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  resultText: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  detailsText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  goHome: {
    textDecorationLine: 'underline',
    fontSize: 17,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  confettiContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
    zIndex: 10,
  },
  confettiFixedHeightWrapper: {
    width: '100%',
    height: 190, // Always reserve space for confetti
    alignItems: 'center',
    justifyContent: 'flex-end', // push confetti to bottom of reserved space
  },
  resultCardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    justifyContent: 'center',
  },
});

export default PaymentResultScreen;