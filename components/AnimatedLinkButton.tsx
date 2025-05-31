import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/utils/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface AnimatedLinkButtonProps {
  onPress: () => void;
  title: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  showShimmer?: boolean;
}

export const AnimatedLinkButton = ({
  onPress,
  title,
  icon = 'arrow-forward',
  style,
  iconSize = 24,
  showShimmer = false,
}: AnimatedLinkButtonProps) => {
  const colors = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (showShimmer) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 100,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showShimmer]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(translateXAnim, {
        toValue: 5,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(translateXAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style]}
    >
      <View style={[styles.buttonContainer, { backgroundColor: colors.success }]}>
        <Animated.View style={[
          styles.content,
          {
            transform: [
              { scale: scaleAnim },
              { translateX: translateXAnim }
            ]
          }
        ]}>
          <ThemedText type="link" style={[styles.text, { color: colors.card }]}>
            {title}
          </ThemedText>
          <MaterialIcons name={icon} size={iconSize} color={colors.card} />
        </Animated.View>
        {showShimmer && (
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [
                  { translateX: shimmerAnim },
                  { rotate: '35deg' }
                ],
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            ]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    overflow: 'hidden',
  },
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  text: {
    marginRight: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  shimmer: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    width: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}); 