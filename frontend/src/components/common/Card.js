import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadows } from '../../utils/theme';

const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 16,
  glass = false,
  glow = false
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

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

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
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  }
});

export default Card;
