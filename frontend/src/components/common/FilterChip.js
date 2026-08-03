import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const FilterChip = React.memo(({
  label,
  selected = false,
  onPress,
  icon,
  style
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} filter`}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        animatedStyle,
        style
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>
        {label}
      </Text>
    </AnimatedTouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minHeight: 36
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  unselectedChip: {
    backgroundColor: Colors.bgCardSecondary,
    borderColor: Colors.glassBorder
  },
  icon: {
    marginRight: 6,
    fontSize: 14
  },
  text: {
    fontSize: 13,
    fontFamily: Typography.bodyMedium
  },
  selectedText: {
    color: Colors.textPrimary
  },
  unselectedText: {
    color: Colors.textSecondary
  }
});

export default FilterChip;
