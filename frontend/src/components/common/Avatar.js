import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '../../utils/theme';

const Avatar = React.memo(({
  url,
  name = 'User',
  size = 'md',
  isVerified = false,
  style
}) => {
  const sizeMap = {
    sm: { width: 36, height: 36, fontSize: 14, badgeSize: 12 },
    md: { width: 48, height: 48, fontSize: 18, badgeSize: 16 },
    lg: { width: 64, height: 64, fontSize: 24, badgeSize: 20 },
    xl: { width: 80, height: 80, fontSize: 32, badgeSize: 24 }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { width: currentSize.width, height: currentSize.height }, style]}>
      {url ? (
        <Image
          source={{ uri: url }}
          style={[styles.image, { width: currentSize.width, height: currentSize.height, borderRadius: currentSize.width / 2 }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: currentSize.width,
              height: currentSize.height,
              borderRadius: currentSize.width / 2
            }
          ]}
        >
          <Text style={[styles.initialText, { fontSize: currentSize.fontSize }]}>{initial}</Text>
        </View>
      )}

      {isVerified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: currentSize.badgeSize,
              height: currentSize.badgeSize,
              borderRadius: currentSize.badgeSize / 2
            }
          ]}
        >
          <Text style={[styles.checkIcon, { fontSize: currentSize.badgeSize * 0.65 }]}>✓</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  image: {
    backgroundColor: Colors.bgCardSecondary
  },
  fallback: {
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    alignItems: 'center',
    justifyContent: 'center'
  },
  initialText: {
    color: Colors.primary,
    fontFamily: Typography.heading
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.bgDark
  },
  checkIcon: {
    color: Colors.textPrimary,
    fontWeight: 'bold'
  }
});

export default Avatar;
