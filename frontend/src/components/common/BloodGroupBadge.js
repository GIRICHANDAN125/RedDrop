import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BloodGroupColors, Colors, Radius, Typography } from '../../utils/theme';

const BloodGroupBadge = ({ group, size = 'md', showLabel = false }) => {
  const color = BloodGroupColors[group] || Colors.primary;

  const sizes = {
    sm: { width: 32, height: 32, fontSize: 10 },
    md: { width: 48, height: 48, fontSize: 14 },
    lg: { width: 64, height: 64, fontSize: 18 },
    xl: { width: 80, height: 80, fontSize: 22 }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <View style={styles.wrapper}>
      <View style={[
        styles.badge,
        {
          width: currentSize.width,
          height: currentSize.height,
          backgroundColor: color + '20',
          borderColor: color + '60'
        }
      ]}>
        <Text style={[styles.text, { color, fontSize: currentSize.fontSize }]}>
          {group}
        </Text>
      </View>
      {showLabel && <Text style={[styles.label, { color }]}>Blood Group</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  badge: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontFamily: 'Sora-Bold',
    letterSpacing: 0.5
  },
  label: {
    fontFamily: Typography.body,
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7
  }
});

export default BloodGroupBadge;
