// components/MemoizeModal.tsx
import React from 'react';
import Modal from 'react-native-modal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image, StyleSheet, Animated, Platform, TouchableOpacity, useColorScheme, SafeAreaView, View, FlatList, ScrollView, Linking, Dimensions } from 'react-native';


// Memoized Modal Component to prevent unnecessary re-renders
interface MemoizedModalProps {
  isVisible: boolean;
  onClose: () => void;
  colors: {
    buttonBackground: string;
    buttonText: string;
  };
}

const MemoizedModal: React.FC<MemoizedModalProps> = React.memo(({ isVisible, onClose, colors }) => (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationInTiming={400} // Increased for smoother entry
      animationOutTiming={400} // Increased for smoother exit
      backdropTransitionOutTiming={0} // Ensures backdrop fades out instantly
      hasBackdrop={true}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      style={{ width: '100%', margin: 0 }}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={{ height: Dimensions.get('window').height * 0.7, width: '100%' }}>
          <ThemedView style={{ flex: 1, borderTopRightRadius: 20, borderTopLeftRadius: 20, padding: 20 }}>
            <ThemedText>Modal</ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.buttonBackground,
                alignSelf: 'center',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 5,
              }}
            >
              <ThemedText style={{ color: colors.buttonText, fontSize: 20 }}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </View>
    </Modal>
  ));

  export default MemoizedModal;