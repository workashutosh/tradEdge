import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradient?: boolean;
  gradientColors?: string[];
  variant?: 'primary' | 'secondary';
  pulseAnimation?: boolean;
}

export const AnimatedButton = ({
  onPress,
  title,
  icon,
  style,
  gradient = false,
  gradientColors = ['#04810E', '#039D74'],
  variant = 'primary',
  pulseAnimation = false,
}: AnimatedButtonProps) => {
  const colors = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulseAnimation) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulseAnimation]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const buttonStyle = [
    styles.button,
    variant === 'secondary' && { backgroundColor: colors.text },
    style,
  ];

  const content = (
    <>
      {icon}
      <ThemedText
        type="defaultSemiBold"
        style={[
          styles.buttonText,
          { color: variant === 'primary' ? colors.card : colors.card },
        ]}
      >
        {title}
      </ThemedText>
    </>
  );

  const animatedStyle = {
    transform: [
      { scale: Animated.multiply(scaleAnim, pulseAnimation ? pulseAnim : 1) }
    ]
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={animatedStyle}>
        {gradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={buttonStyle}
          >
            {content}
          </LinearGradient>
        ) : (
          <Animated.View style={buttonStyle}>{content}</Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 