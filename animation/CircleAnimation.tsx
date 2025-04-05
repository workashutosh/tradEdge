import React, { useEffect, useRef, ReactNode } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface CircleBackgroundViewProps {
  size?: number;
  colors?: string[]; // Array of colors to alternate (e.g., black and white)
  duration?: number;
  delay?: number;
  ringCount?: number; // Number of rings
  style?: ViewStyle;
  children?: ReactNode;
}

const CircleBackgroundView: React.FC<CircleBackgroundViewProps> = ({
  size = 800,
  colors = ['rgba(0, 0, 0, 0.8)', 'rgba(255, 255, 255, 0.8)'], // Black and white
  duration = 2000,
  delay = 400,
  ringCount = 1, // Match the number of rings in the image
  style,
  children,
}) => {
  // Create an array of animation values based on the number of rings
  const animations = useRef(
    Array.from({ length: ringCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animateCircles = () => {
      // Reset all animations
      animations.forEach(anim => anim.setValue(0));

      // Create a sequence for each ring
      const sequences = animations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * delay), // Stagger start times
            Animated.timing(anim, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
              easing: t => t * (2 - t), // EaseOut for smooth expansion
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        )
      );

      // Start all animations
      Animated.parallel(sequences).start();
    };

    animateCircles();

    // Cleanup
    return () => {
      animations.forEach(anim => anim.stopAnimation());
    };
  }, [animations, duration, delay, ringCount]);

  // Create scale and opacity interpolations for each ring
  const circleStyles = animations.map((anim, index) => ({
    scale: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1 + (index * 0.2)], // Gradual increase in size for each ring
    }),
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.5, 0], // Fade out effect
    }),
  }));

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
    circle: {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: size * 0.3, // Static border width
      backgroundColor: 'transparent',
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
        {animations.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                borderColor: colors[index % colors.length],
                transform: [{ scale: circleStyles[index].scale }],
                opacity: circleStyles[index].opacity,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default CircleBackgroundView;