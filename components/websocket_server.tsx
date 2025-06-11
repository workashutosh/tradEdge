import React, { useEffect, useState } from 'react';
import { View, Text, Alert, FlatList, StyleSheet } from 'react-native';
import Pusher from 'pusher-js/react-native';
import * as Notifications from 'expo-notifications';

const TradeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  let pusher = null;
  let channel = null;

  useEffect(() => {
    pusher = new Pusher('ce530c8474b3ed1e6efd', {
      cluster: 'mt1',
    });

    channel = pusher.subscribe('notifications-all');

    pusher.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('Connected to Pusher');
    });

    pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
      console.log('Disconnected from Pusher');
    });

    channel.bind('new-trade-notification', (data) => {
      console.log('New trade notification:', data);
      handleNewTradeNotification(data);
    });

    channel.bind('new-notification', (data) => {
      console.log('Followup notification:', data);
      handleFollowupNotification(data);
    });

    channel.bind('all-pending-followups', (data) => {
      console.log('Pending followups:', data);
      handlePendingFollowups(data);
    });

    return () => {
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  // ✅ Make this async since we're using await
  const handleNewTradeNotification = async (data) => {
    const notification = {
      id: `trade_${data.trade_id}_${Date.now()}`,
      type: 'trade',
      title: 'New Trade Alert',
      message: data.message,
      timestamp: data.timestamp,
      data,
    };

    setNotifications((prev) => [notification, ...prev]);

    const packageInfo =
      data.package_subtypes && data.package_subtypes.length > 0
        ? `Packages: ${data.package_subtypes.join(', ')}`
        : '';

    // ✅ Show local system notification
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

    // Optional in-app alert
    Alert.alert(
      'New Trade Alert!',
      `${data.stock_symbol} - ${data.trade_type.toUpperCase()} at ₹${data.target_price}${packageInfo ? `\n${packageInfo}` : ''}`,
      [{ text: 'OK' }]
    );
  };

  const handleFollowupNotification = (data) => {
    const notification = {
      id: `followup_${data.id}_${Date.now()}`,
      type: 'followup',
      title: 'Follow-up Due',
      message: data.message,
      timestamp: data.timestamp,
      data,
    };

    setNotifications((prev) => [notification, ...prev]);
  };

  const handlePendingFollowups = (data) => {
    if (data.count > 0) {
      Alert.alert(
        'Pending Follow-ups',
        `You have ${data.count} pending follow-ups`,
        [{ text: 'OK' }]
      );
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <Text style={styles.notificationMessage}>{item.message}</Text>

      {item.type === 'trade' && item.data && (
        <View style={styles.tradeDetails}>
          <Text style={styles.detailText}>Trade ID: {item.data.trade_id}</Text>
          <Text style={styles.detailText}>Symbol: {item.data.stock_symbol}</Text>
          <Text style={styles.detailText}>Type: {item.data.trade_type?.toUpperCase()}</Text>
          {item.data.target_price && (
            <Text style={styles.detailText}>Target: ₹{item.data.target_price}</Text>
          )}
          {item.data.package_subtypes && item.data.package_subtypes.length > 0 && (
            <Text style={styles.detailText}>
              Packages: {item.data.package_subtypes.join(', ')} ({item.data.package_count} total)
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trade Notifications</Text>
        <View style={[styles.connectionStatus, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isConnected ? 'No notifications yet' : 'Connecting...'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  connectionStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
  notificationCard: { backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  notificationTime: { fontSize: 12, color: '#666' },
  notificationMessage: { fontSize: 14, color: '#555', marginBottom: 8 },
  tradeDetails: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 6, marginTop: 8 },
  detailText: { fontSize: 12, color: '#666', marginBottom: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: '#999' },
});

export default TradeNotifications;
