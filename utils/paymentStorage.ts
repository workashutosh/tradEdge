import AsyncStorage from '@react-native-async-storage/async-storage';

export const updatePaymentStatus = async (
  merchantOrderId: string,
  status: string,
  paymentMethod?: string,
  phonepeTransactionId?: string
) => {
  try {
    const paymentKey = `payment_${merchantOrderId}`;
    const paymentJson = await AsyncStorage.getItem(paymentKey);
    
    if (!paymentJson) {
      throw new Error('Payment record not found');
    }

    const payment = JSON.parse(paymentJson);
    const updatedPayment = {
      ...payment,
      status,
      paymentMethod: paymentMethod || payment.paymentMethod,
      phonepeTransactionId,
      updatedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem(paymentKey, JSON.stringify(updatedPayment));
    return updatedPayment;
  } catch (error) {
    console.error('Error updating payment status payment Storage:', error);
    throw error;
  }
};

export const getPaymentDetails = async (merchantOrderId: string) => {
  try {
    const paymentJson = await AsyncStorage.getItem(`payment_${merchantOrderId}`);
    return paymentJson ? JSON.parse(paymentJson) : null;
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw error;
  }
};