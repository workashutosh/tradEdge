import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface BuyProPopupProps {
  visible: boolean;
  onClose: () => void;
  colors: {
    background: string;
    text: string;
    card: string;
    primary: string;
  };
}

export const BuyProPopup: React.FC<BuyProPopupProps> = ({ visible, onClose, colors }) => {
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height * 0.6)).current;

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height * 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose()); // Call onClose after animation completes
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible && slideAnim.__getValue() === Dimensions.get('window').height * 0.6) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.background} onPress={handleClose} />
      <Animated.View
        style={[
          styles.popup,
          { backgroundColor: colors.card },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Upgrade to Pro
        </ThemedText>
        <ThemedText style={[styles.text, { color: colors.text }]}>
          Unlock premium features with a Pro subscription! Enjoy exclusive content, advanced tools, and more.
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleClose}
        >
          <ThemedText style={styles.buttonText}>Got it!</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  background: {
    flex: 1,
  },
  popup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});