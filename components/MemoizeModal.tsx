import React from 'react';
import Modal from 'react-native-modal';
import { ThemedText } from '@/components/ThemedText';
import { Image, StyleSheet, TouchableOpacity, Dimensions, View, Text } from 'react-native';

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
    animationInTiming={400}
    animationOutTiming={400}
    backdropTransitionOutTiming={0}
    hasBackdrop={true}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    swipeDirection="down"
    onSwipeComplete={onClose}
    style={styles.modal}
  >
    <View style={styles.container}>
      <View style={styles.content}>
        {/* <Text style={styles.modalText}>Modal</Text> */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/modalBg2.png')} // Try relative path first
            style={styles.image}
            resizeMode="contain" // Explicitly set resizeMode
          />
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: colors.buttonBackground }]}
        >
          <ThemedText style={[styles.closeButtonText, { color: colors.buttonText }]}>
            Close
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
));

const styles = StyleSheet.create({
  modal: {
    width: '100%',
    margin: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    height: Dimensions.get('window').height * 0.7,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgb(55, 55, 55)',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '150%', // Define container width
    height: '90%', // Limit image container height
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  image: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain', // Ensure image scales properly
  },
  modalText: {
    fontSize: 20,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 20, // Add some spacing
  },
  closeButtonText: {
    fontSize: 20,
  },
});

export default MemoizedModal;