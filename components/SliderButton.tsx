import React, { useRef, useEffect } from 'react';
import { StyleSheet, Animated, PanResponder, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface SliderButtonProps {
  name: string; // New prop for button text
  colors: {
    buttonPrimary: string;
  };
  onPress: () => void;
}

const SliderButton: React.FC<SliderButtonProps> = ({ name, colors, onPress }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const wiggleAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const buttonWidth = 280;
  const sliderWidth = 60;
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

  const stopWiggle = () => {
    if (wiggleAnimation.current) {
      wiggleAnimation.current.stop();
      wiggleAnimation.current = null;
    }
  };

  useEffect(() => {
    startWiggle();
    return () => stopWiggle();
  }, []);

  const textOpacity = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backgroundColor = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [colors.buttonPrimary, '#99ff99'],
    extrapolate: 'clamp',
  });

  const glowOpacity = pan.interpolate({
    inputRange: [0, buttonWidth - sliderWidth],
    outputRange: [0.3, 0.8],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const maxX = buttonWidth - sliderWidth - padding * 2;
      const newX = Math.max(0, Math.min(gestureState.dx, maxX));
      pan.setValue(newX);
    },
    onPanResponderRelease: (_, gestureState) => {
      const threshold = buttonWidth - sliderWidth - padding * 2 - 10;
      const maxPosition = buttonWidth - sliderWidth - padding * 2;

      if (gestureState.dx >= threshold) {
        Animated.spring(pan, {
          toValue: maxPosition,
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start(({ finished }) => {
          if (finished) {
            onPress();
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: true,
              friction: 7,
              tension: 40,
            }).start(({ finished }) => {
              if (finished) startWiggle();
            });
          }
        });
      } else {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start(({ finished }) => {
          if (finished) startWiggle();
        });
      }
    },
  });

  return (
    <Animated.View
      style={[
        styles.sliderButton,
        {
          backgroundColor,
          shadowColor: colors.buttonPrimary,
          shadowOpacity: glowOpacity,
          shadowRadius: 10,
          elevation: 8,
        },
      ]}
    >
      <View style={[styles.track, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
      <Animated.Text
        style={[
          styles.sliderButtonText,
          {
            opacity: textOpacity,
            color: '#ffffff',
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          },
        ]}
      >
        {name}
      </Animated.Text>
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [{ translateX: pan }],
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: colors.buttonPrimary,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <MaterialIcons name="chevron-right" size={24} color={colors.buttonPrimary} style={styles.chevron} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sliderButton: {
    width: 280,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  sliderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  slider: {
    position: 'absolute',
    left: 5,
    width: 60,
    height: 40,
    top: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 4,
  },
});

export default SliderButton;