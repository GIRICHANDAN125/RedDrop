import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius, Shadows, Spacing } from '../../utils/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const FAB = React.memo(({
  icon = '➕',
  label,
  onPress,
  pulse = false,
  style
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withTiming(1.1, { duration: 900 }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label || 'Floating action button'}
      style={[
        styles.fab,
        label ? styles.extendedFab : styles.circularFab,
        animatedStyle,
        style
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </AnimatedTouchableOpacity>
  );
});

const styles = StyleSheet.create({
  fab: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
    elevation: 8,
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    zIndex: 99
  },
  circularFab: {
    width: 56,
    height: 56,
    borderRadius: Radius.full
  },
  extendedFab: {
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full
  },
  icon: {
    fontSize: 20,
    color: Colors.textPrimary
  },
  label: {
    fontFamily: Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm
  }
});

export default FAB;
