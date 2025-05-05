import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/UserContext';

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
  const route = useRoute();
  const { getUserTransactions }=useUser();

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

  const updateDB = async (paymentState: string, payment_method: string) => {
    try {
      const updateStatusResponse = await axios.post(`http://192.168.1.40:5000/api/addPaymentindb`, {
      // const updateStatusResponse = await axios.post(`https://tradedge-server.onrender.com/api/addPaymentindb`, {
        package_id: package_id,
        user_id: user_id,
        amount: amount,
        payment_status: paymentState,
        payment_date: payment_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
        transaction_id: transaction_id,
        payment_method: payment_method || 'PHONEPE',
      });
      console.log('Payment status updated in DB:', updateStatusResponse.data);
    } catch (error) {
      console.error('Error updating payment status index:', (error as Error).message);
    }
  };

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!transaction_id) {
        // setStatus('FAILURE');
        setLoading(false);
        return;
      }

      try {
        // const response = await axios.get(`https://tradedge-server.onrender.com/api/paymentStatus`, {
        const response = await axios.get(`http://192.168.1.40:5000/api/paymentStatus`, {
          params: { transaction_id },
        });

        const paymentData = response.data.status || {};
        const paymentState = paymentData.state || 'FAILURE';
        const paymentDetails = paymentData.paymentDetails?.[0] || {};

        console.log('Payment Data:', paymentData);

        setStatus(paymentState === 'COMPLETED' ? 'SUCCESS' : 'FAILURE');
        setTransactionDetails({
          transaction_id: paymentDetails.transactionId,
          payment_method: paymentDetails.paymentMode,
          amount: paymentDetails.amount,
        });

        // Update AsyncStorage with payment status and method
        const updatedTransactionDetails = {
          transaction_id: paymentDetails.transactionId || transaction_id,
          package_id: package_id,
          user_id: user_id,
          amount: paymentDetails.amount || amount,
          payment_status: paymentState,
          payment_date: payment_date || getISTDate(),
          payment_method: paymentDetails.paymentMode || 'PHONEPE',
        };

        await AsyncStorage.setItem('transactionDetails', JSON.stringify(updatedTransactionDetails));
        console.log('✅ AsyncStorage updated with payment status and method');

        // Update the database with the payment status
        await updateDB(paymentState, paymentDetails.paymentMode);

        // Fetch user transactions after updating the payment status
        await getUserTransactions(user_id);
        

      } catch (error) {
        console.error('Error fetching payment status:', (error as Error).message);
        setStatus('FAILURE');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [transaction_id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.detailsText}>Fetching payment status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {status === 'SUCCESS' && (
        <Animated.View
          entering={SlideInUp.duration(500)}
          exiting={SlideOutDown.duration(500)}
          style={styles.successContainer}
        >
          <ThemedText type="defaultSemiBold" style={styles.successText}>Payment Successful!</ThemedText>
          <ThemedText type="default" style={styles.detailsText}>
            Transaction ID: {transactionDetails?.transaction_id}
          </ThemedText>
          <ThemedText type="default" style={styles.detailsText}>
            Payment Mode: {transactionDetails?.payment_method}
          </ThemedText>
          <ThemedText type="default" style={styles.detailsText}>
            Amount: {transactionDetails?.amount ? formatIndianRupee(Number(transactionDetails.amount) / 100) : 'N/A'}
          </ThemedText>
        </Animated.View>
      )}
      {status === 'FAILURE' && (
        <Animated.View
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          style={styles.failureContainer}
        >
          <ThemedText type="defaultSemiBold" style={styles.failureText}>Payment Failed</ThemedText>
          <ThemedText type="default" style={styles.detailsText}>Please try again.</ThemedText>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  successContainer: {
    padding: 20,
    backgroundColor: '#d4edda',
    borderRadius: 10,
  },
  failureContainer: {
    padding: 20,
    backgroundColor: '#f8d7da',
    borderRadius: 10,
  },
  successText: {
    fontSize: 18,
    color: '#155724',
    fontWeight: 'bold',
  },
  failureText: {
    fontSize: 18,
    color: '#721c24',
    fontWeight: 'bold',
  },
  detailsText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 10,
  },
});

export default PaymentResultScreen;