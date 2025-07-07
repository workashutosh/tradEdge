import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, FlatList, StyleSheet } from 'react-native';
import Pusher from 'pusher-js/react-native';
import * as Notifications from 'expo-notifications';
import { useUser } from '../context/UserContext';
import { useStockContext } from '../context/StockContext';

const TradeNotifications = ({ onNewTradeTip, existingTradeTips = [], onUpdateTradeLists ,phoneNumber, }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [liveTradeIds, setLiveTradeIds] = useState(new Set());
  const [fetchedTrades, setFetchedTrades] = useState([]); // ✅ store all fetched trades
  const [todaysTrades, setTodaysTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [phone, setPhone] = useState('');

  const { userTransactions } = useUser();
  const { addLiveTrade } = useStockContext();

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    console.log('🚀 fetchTrades useEffect triggered');

    const fetchTrades = async () => {
      try {
        const authToken = 'your-auth-token';

        const response = await fetch('https://gateway.twmresearchalert.com/trades?type=all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        const raw = await response.json();
        console.log('📦 Raw API response:');
        
        let trades = [];
        if (Array.isArray(raw)) {
      console.log('✅ raw is an array');
      trades = raw;
    } else if (Array.isArray(raw?.data)) {
      console.log('✅ raw.data is an array');
      trades = raw.data;
    } else if (Array.isArray(raw?.trades)) {
      console.log('✅ raw.trades is an array');
      trades = raw.trades;
    } else {
      console.error('❌ No valid array found in API response:', raw);
      return;
    }
        
        const formattedTrades = trades.map((t) => {
            const parsedDate = new Date(t.created_at || Date.now()); // Properly parsed

            return {
              id: String(t.trade_id),
              stockSymbol: t.stock_symbol,
              stockName: t.stock_symbol,
              entryPrice: Number(t.entry_price || 0),
              targetPrice: Number(t.target_price),
              stopLoss: Number(t.stop_loss || 0),
              timeFrame: t.time_frame || '1 Week',
              prediction: {
                type: t.trade_type === 'buy' ? 'bullish' : 'bearish',
                confidence: Number(t.confidence || 70),
                potentialProfit: Number(t.potential_profit || 5),
                potentialLoss: Number(t.potential_loss || 2),
              },
              analysis: t.description || '',
              riskLevel: t.risk_level || 'Medium',
              recommendedInvestment: Number(t.recommended_investment || 50000),
              timestamp: parsedDate.toISOString(), // ✅ normalized
            };
          });

          // Helper function to check if two dates are the same day
          const isSameDay = (date1, date2) =>
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();

          const today = new Date();

          // ✅ Now filter trades for today
          const todaysTrades = formattedTrades.filter((trade) =>
            isSameDay(new Date(trade.timestamp), today)
          );

          // ✅ Use in your state update or `onUpdateTradeLists`
          setTodaysTrades(todaysTrades);
          setAllTrades(formattedTrades);


        

        if (typeof onUpdateTradeLists === "function") {
          onUpdateTradeLists(todaysTrades, formattedTrades);
        }

      } catch (error) {
        console.error('❌ Failed to fetch trades:', error);
      }
    };

    fetchTrades();
  }, [userTransactions]);

const handleNewTradeNotification = useCallback(async (data) => {
  const tradeSubtypeIds = data.package_subtypes?.map(String) || [];
  const now = new Date();

  const validUserPackageIds = userTransactions
    ?.filter((txn) => {
      const expiry = new Date(txn.purchase_info?.expiry_date);
      return txn.purchase_info?.status === 'active' && expiry > now;
    })
    .map((txn) => String(txn.package_details?.subtype_id));

  const hasAccess = tradeSubtypeIds.some((id) => validUserPackageIds.includes(id));
  if (!hasAccess) {
    console.log('❌ Skipped. User doesn’t have valid package for this trade.');
    return;
  }

  const formattedTrade = {
    id: String(data.trade_id),
    stockSymbol: data.stock_symbol,
    stockName: data.stock_symbol,
    entryPrice: Number(data.entry_price || 0),
    targetPrice: Number(data.target_price || 0),
    stopLoss: Number(data.stop_loss || 0),
    timeFrame: data.time_frame || '1 Week',
    prediction: {
      type: data.trade_type === 'buy' ? 'bullish' : 'bearish',
      confidence: Number(data.confidence || 70),
      potentialProfit: Number(data.potential_profit || 5),
      potentialLoss: Number(data.potential_loss || 2),
    },
    analysis: data.message || '',
    riskLevel: data.risk_level || 'Medium',
    recommendedInvestment: Number(data.recommended_investment || 50000),
    timestamp: data.timestamp || new Date().toISOString(),
  };

  if (!liveTradeIds.has(formattedTrade.id)) {
    addLiveTrade?.(formattedTrade);
    onNewTradeTip?.(formattedTrade);
    setFetchedTrades((prev) => [formattedTrade, ...prev]);
    setLiveTradeIds((prev) => {
  const updated = new Set(prev);
  updated.add(formattedTrade.id);
  return updated;
});
  }

  const notification = {
    id: `trade_${data.trade_id}`,
    type: 'trade',
    title: 'New Trade Alert',
    message: data.message,
    timestamp: data.timestamp,
    data,
  };

  setNotifications((prev) => {
    const exists = prev.some(
      (n) => n.data?.trade_id === data.trade_id && n.type === 'trade'
    );
    return exists ? prev : [notification, ...prev];
  });

  const packageInfo =
    data.package_subtypes?.length > 0
      ? `Packages: ${data.package_subtypes.join(', ')}`
      : '';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📈 ${data.stock_symbol} Trade Alert (${data.trade_type.toUpperCase()})`,
      body: `Target: ₹${data.target_price} • ${packageInfo}`,
      sound: 'default',
      data: {
        screen: 'TradeDetailedCard',
        tradeTip: {
          stockSymbol: data.stock_symbol,
          targetPrice: data.target_price,
          tradeType: data.trade_type,
          tradeId: data.trade_id,
          timestamp: data.timestamp,
          message: data.message,
        },
      },
    },
    trigger: null,
  });

  Alert.alert(
    'New Trade Alert!',
    `${data.stock_symbol} - ${data.trade_type.toUpperCase()} at ₹${data.target_price}${
      packageInfo ? `\n${packageInfo}` : ''
    }`,
    [{ text: 'OK' }]
  );

const rawPhone = phoneNumber || (userTransactions?.length ? userTransactions[0]?.user?.whatsapp_number : '');
const cleanedPhone = cleanPhoneNumber(rawPhone);

console.log("📱 Raw:", rawPhone, "| Cleaned:", cleanedPhone);

if (cleanedPhone) {
  await sendTradeWhatsAppMessage(formattedTrade, cleanedPhone);
} else {
  console.warn("⚠️ Invalid phone number:", rawPhone);
  Alert.alert("Invalid Number", `❌ Cannot send WhatsApp. Invalid: ${rawPhone}`);
}



}, [userTransactions, liveTradeIds, addLiveTrade, onNewTradeTip]);


  const handleFollowupNotification = useCallback((data) => {
    const notification = {
      id: `followup_${data.id}_${Date.now()}`,
      type: 'followup',
      title: 'Follow-up Due',
      message: data.message,
      timestamp: data.timestamp,
      data,
    };
    setNotifications((prev) => {
      const exists = prev.some(
        (n) => n.data?.id === data.id && n.type === 'followup'
      );
      return exists ? prev : [notification, ...prev];
    });
  }, []);

  const handlePendingFollowups = useCallback((data) => {
    if (data.count > 0) {
      Alert.alert('Pending Follow-ups', `You have ${data.count} pending follow-ups`, [{ text: 'OK' }]);
    }
  }, []);

  useEffect(() => {
    const pusher = new Pusher('ce530c8474b3ed1e6efd', { cluster: 'mt1' });
    const channel = pusher.subscribe('notifications-all');

    pusher.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('✅ Connected to Pusher');
    });

    pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
      console.log('⚠️ Disconnected from Pusher');
    });

    channel.bind('new-trade-notification', handleNewTradeNotification);
    channel.bind('new-notification', handleFollowupNotification);
    channel.bind('all-pending-followups', handlePendingFollowups);

    return () => {
      channel.unbind('new-trade-notification', handleNewTradeNotification);
      channel.unbind('new-notification', handleFollowupNotification);
      channel.unbind('all-pending-followups', handlePendingFollowups);
      pusher.unsubscribe('notifications-all');
      pusher.disconnect();
    };
  }, [handleNewTradeNotification, handleFollowupNotification, handlePendingFollowups]);
  

const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits; // ✅ exactly what Cunnekt wants
  }

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `91${digits}`; // ✅ prepend 91
  }

  return ''; // ❌ Invalid number
};



// Inside the same file or import from utils if separated
const sendTradeWhatsAppMessage = async (trade, phoneNumber) => {
  console.log("📞 Cleaned phone number:", phoneNumber);
console.log("📦 Final Cunnekt payload 'to':", phoneNumber);
  console.log("📨 Message payload:", {
    stock: trade.stockSymbol,
    target: trade.targetPrice,
    type: trade.prediction?.type,
  });

  try {
    const whatsappApiUrl = 'https://app2.cunnekt.com/v1/sendnotification';
    const apiKey = '3115c6ff026625317b9df24d692570ecab70ffb1';

    const messagePayload = {
        mobile: phoneNumber.replace(/^\+/, ''), // ✅ remove + if present
        templateid: '1207184657851670',  
      parameters: {
        body: [
          { type: 'text', text: trade.stockSymbol },
          { type: 'text', text: `${trade.targetPrice}` },
          { type: 'text', text: `${trade.prediction?.type}` },
        ],
      },
    };


    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    const result = await response.json();
    console.log("📦 WhatsApp API Response:", result);

    if (response.ok && result.status) {
      Alert.alert?.(`✅ WhatsApp message sent to ${phoneNumber}`);
      return true;
    } else {
      console.error('❌ WhatsApp message failed:', result);
      Alert.alert?.(`❌ WhatsApp failed: ${result?.message || 'Unknown error'}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    Alert.alert?.('⚠️ Error sending WhatsApp confirmation.');
    return false;
  }
};


  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  const renderTradeCard = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.stockSymbol}</Text>
        <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <Text style={styles.notificationMessage}>{item.analysis}</Text>
      <View style={styles.tradeDetails}>
        <Text style={styles.detailText}>Target Price: ₹{item.targetPrice}</Text>
        <Text style={styles.detailText}>Stop Loss: ₹{item.stopLoss}</Text>
        <Text style={styles.detailText}>Prediction: {item.prediction?.type}</Text>
        <Text style={styles.detailText}>Risk Level: {item.riskLevel}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ padding: 12 }}>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
          Trade Notifications
        </Text>

        <View
          style={{
            backgroundColor: isConnected ? '#C8E6C9' : '#FFCDD2',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isConnected ? '#4CAF50' : '#F44336',
              marginRight: 8,
            }}
          />
          <Text style={{ fontSize: 14, fontWeight: '600', color: isConnected ? '#2E7D32' : '#C62828' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
    </View>


  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  connectionStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
  notificationCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  notificationTime: { fontSize: 12, color: '#666' },
  notificationMessage: { fontSize: 14, color: '#555', marginBottom: 8 },
  tradeDetails: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 6, marginTop: 8 },
  detailText: { fontSize: 12, color: '#666', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
});

export default TradeNotifications;
