import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const AchievementBadge = React.memo(({
  badge,
  unlocked = false,
  style
}) => {
  const icon = badge?.icon || '🏅';
  const label = badge?.label || 'Badge';
  const desc = badge?.desc || '';

  return (
    <Card
      style={[
        styles.container,
        !unlocked && styles.lockedContainer,
        style
      ]}
      variant={unlocked ? 'primary' : 'default'}
    >
      <View style={[styles.iconContainer, !unlocked && styles.lockedIconContainer]}>
        <Text style={[styles.icon, !unlocked && styles.lockedText]}>{icon}</Text>
      </View>
      <Text style={[styles.label, !unlocked && styles.lockedText]} numberOfLines={1}>
        {label}
      </Text>
      {desc ? (
        <Text style={styles.desc} numberOfLines={2}>
          {desc}
        </Text>
      ) : null}
      {!unlocked && (
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </Card>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    width: 130,
    position: 'relative'
  },
  lockedContainer: {
    opacity: 0.55
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm
  },
  lockedIconContainer: {
    backgroundColor: Colors.bgCardSecondary
  },
  icon: {
    fontSize: 24
  },
  label: {
    fontFamily: Typography.headingSemibold,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2
  },
  desc: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center'
  },
  lockedText: {
    color: Colors.textMuted
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8
  },
  lockIcon: {
    fontSize: 12
  }
});

export default AchievementBadge;
