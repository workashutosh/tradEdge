import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';

interface BuyProButtonProps {
  setIsPopupVisible: (visible: boolean) => void;
}

const BuyProButton: React.FC<BuyProButtonProps> = ({ setIsPopupVisible }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8}
      onPress={() => {
        router.push('/main/BuyPackageOffer');
      }}
    >
      <LinearGradient
        colors={[
          '#880088',
          '#aa2068',
          '#cc3f47',
          '#de6f3d',
          '#f09f33',
          '#de6f3d',
          '#cc3f47',
          '#aa2068',
          '#880088',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Svg width={23} height={24} viewBox="0 0 36 24">
          <Path
            d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"
            fill="#f09f33"
          />
        </Svg>
        <Text style={styles.buttonText}>Buy Pro</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 'auto', // React Native doesn't support 'fit-content', so use 'auto' or specific width
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5, // 0.8em ≈ 12px (assuming 1em = 15px)
    paddingHorizontal: 16, // 1.1em ≈ 16px
    borderRadius: 30,
    gap: 6, // 0.4rem ≈ 6px
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(136, 0, 136, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});

export default BuyProButton;