import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Radius, Shadows } from '../../utils/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Card = React.memo(({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 16,
  glass = false,
  glow = false,
  animate = true,
  index = 0
}) => {
  const variants = {
    default: { backgroundColor: Colors.bgCard, borderColor: Colors.glassBorder },
    elevated: { backgroundColor: Colors.bgCardSecondary, borderColor: Colors.glassBorder },
    primary: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary + '40' },
    success: { backgroundColor: Colors.successBg, borderColor: Colors.success + '40' },
    warning: { backgroundColor: Colors.warningBg, borderColor: Colors.warning + '40' },
    error: { backgroundColor: Colors.errorBg, borderColor: Colors.error + '40' },
    critical: { backgroundColor: Colors.criticalBg, borderColor: Colors.critical + '60' }
  };

  const currentVariant = variants[variant] || variants.default;

  const cardStyle = [
    styles.card,
    currentVariant,
    glass && styles.glass,
    glow && styles.glow,
    { padding },
    style
  ];

  const entering = animate ? FadeInDown.delay(Math.min(index, 5) * 40).duration(300) : undefined;

  if (onPress) {
    return (
      <AnimatedTouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        entering={entering}
        accessible={true}
        accessibilityRole="button"
        style={cardStyle}
      >
        {children}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <Animated.View entering={entering} style={cardStyle}>
      {children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    ...Shadows.card,
    overflow: 'hidden'
  },
  glass: {
    backgroundColor: Colors.glass,
    borderColor: Colors.glassBorder
  },
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10
  }
});

export default Card;
