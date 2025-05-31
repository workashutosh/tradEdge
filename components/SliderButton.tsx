import React, { useRef, useEffect } from 'react';
import { StyleSheet, Animated, PanResponder, View, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

interface SliderButtonProps {
  name: string;
  colors: {
    buttonPrimary: string;
  };
  onPress: () => void;
}

const SliderButton: React.FC<SliderButtonProps> = ({ name, colors, onPress }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const wiggleAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const buttonWidth = Dimensions.get('window').width - 40; // Full width minus padding
  const sliderWidth = 70;
  const padding = 5;

  const startWiggle = () => {
    wiggleAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pan, {
          toValue: 10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pan, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    wiggleAnimation.current.start();
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopWiggle = () => {
    if (wiggleAnimation.current) {
      wiggleAnimation.current.stop();
      wiggleAnimation.current = null;
    }
  };

  useEffect(() => {
    startWiggle();
    startPulse();
    return () => stopWiggle();
  }, []);

  const textOpacity = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backgroundColor = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [colors.buttonPrimary, '#4CAF50'],
    extrapolate: 'clamp',
  });

  const sliderScale = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [1, 1.1],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      stopWiggle();
    },
    onPanResponderMove: (_, gestureState) => {
      const newValue = Math.max(0, Math.min(gestureState.dx, buttonWidth - sliderWidth - padding * 2));
      pan.setValue(newValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > buttonWidth - sliderWidth - padding * 2) {
        onPress();
      }
      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
        tension: 40,
      }).start(() => {
        startWiggle();
      });
    },
  });

  return (
    <Animated.View
      style={[
        styles.sliderButton,
        {
          transform: [{ scale: pulseAnimation }],
          backgroundColor: colors.buttonPrimary,
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
        style={styles.track}
      />
      <Animated.Text
        style={[
          styles.sliderButtonText,
          {
            opacity: textOpacity,
            color: '#ffffff',
          },
        ]}
      >
        {name}
      </Animated.Text>
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [
              { translateX: pan },
              { scale: sliderScale }
            ],
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: colors.buttonPrimary,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[colors.buttonPrimary, colors.buttonPrimary + 'CC']}
          style={styles.sliderGradient}
        >
          <MaterialIcons name="chevron-right" size={24} color="#ffffff" style={styles.chevron} />
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sliderButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  sliderButtonText: {
    fontSize: 18,
    fontWeight: '600',
    zIndex: 1,
    backgroundColor: 'transparent',
    letterSpacing: 0.5,
  },
  slider: {
    position: 'absolute',
    left: 5,
    width: 70,
    height: 50,
    top: 4,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 4,
  },
});

export default SliderButton;