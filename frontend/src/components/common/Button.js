import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius } from '../../utils/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withTiming(0.85);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1);
  };

  const handlePress = () => {
    if (!loading && !disabled && onPress) onPress();
  };

  const variants = {
    primary: {
      background: disabled ? Colors.textMuted : Colors.primary,
      text: Colors.textPrimary,
      border: 'transparent'
    },
    secondary: {
      background: Colors.bgCardSecondary,
      text: Colors.textPrimary,
      border: Colors.glassBorder
    },
    outline: {
      background: 'transparent',
      text: Colors.primary,
      border: Colors.primary
    },
    ghost: {
      background: 'transparent',
      text: Colors.textSecondary,
      border: 'transparent'
    },
    danger: {
      background: Colors.errorBg,
      text: Colors.error,
      border: Colors.error
    },
    success: {
      background: Colors.successBg,
      text: Colors.success,
      border: Colors.success
    }
  };

  const sizes = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, height: 36 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, height: 52 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17, height: 60 }
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.base,
        {
          backgroundColor: currentVariant.background,
          borderColor: currentVariant.border,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          height: currentSize.height,
          width: fullWidth ? '100%' : 'auto',
          borderWidth: currentVariant.border !== 'transparent' ? 1 : 0
        },
        animatedStyle,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, { color: currentVariant.text, fontSize: currentSize.fontSize }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontFamily: Typography.bodyMedium,
    letterSpacing: 0.3
  },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 }
});

export default Button;
