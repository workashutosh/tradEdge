import React, { useEffect, useRef, ReactNode } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface CircleBackgroundViewProps {
  size?: number;
  outerColor?: string;
  innerColor?: string;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  children?: ReactNode;
}

const CircleBackgroundView: React.FC<CircleBackgroundViewProps> = ({
  size = 800,
  outerColor = 'rgba(0, 128, 255, 0.2)',
  innerColor = 'rgba(0, 128, 255, 0.4)',
  duration = 2000,
  delay = 500,
  style,
  children,
}) => {
  const outerAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const innerAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;

  useEffect(() => {
    const animateCircles = () => {
      outerAnimation.setValue(0);
      innerAnimation.setValue(0);

      Animated.loop(
        Animated.sequence([
          Animated.timing(outerAnimation, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(outerAnimation, {
            toValue: 0,
            duration: 0, // Instant reset
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(innerAnimation, {
            toValue: 1,
            duration: duration * 0.75,
            useNativeDriver: true,
          }),
          Animated.timing(innerAnimation, {
            toValue: 0,
            duration: 0, // Instant reset
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateCircles();
  }, [outerAnimation, innerAnimation, duration, delay]);

  const outerScale = outerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1.2],
  });

  const innerScale = innerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const outerOpacity = outerAnimation.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.8, 0.8, 0],
  });

  const innerOpacity = innerAnimation.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.8, 0.8, 0],
  });

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      overflow: 'visible',
    },
    animationContainer: {
      position: 'absolute',
      width: size,
      height: size,
      top: '50%',
      left: '50%',
      transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
      zIndex: 0,
    },
    outerCircle: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: outerColor,
    },
    innerCircle: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: innerColor,
    },
    content: {
      zIndex: 1,
      width: '100%',
      height: '100%',
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.outerCircle,
            {
              transform: [{ scale: outerScale }],
              opacity: outerOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.innerCircle,
            {
              transform: [{ scale: innerScale }],
              opacity: innerOpacity,
            },
          ]}
        />
      </View>
      <View style={styles.content

}>{children}</View>
    </View>
  );
};

export default CircleBackgroundView;