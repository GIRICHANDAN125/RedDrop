import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const VolunteerCard = React.memo(({
  volunteer,
  onPress,
  index = 0,
  style
}) => {
  if (!volunteer) return null;

  const name = volunteer.name || volunteer.user?.name || 'Volunteer Hero';
  const role = volunteer.roleTitle || 'Community Coordinator';
  const campsCount = volunteer.campsOrganized || volunteer.campsAttended || 0;
  const avatarUrl = volunteer.avatar?.url || volunteer.user?.avatar?.url;
  const isVerified = volunteer.isVerified ?? true;

  return (
    <Card onPress={onPress} index={index} style={[styles.card, style]}>
      <View style={styles.contentRow}>
        <Avatar url={avatarUrl} name={name} size="md" isVerified={isVerified} />

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Volunteer</Text>
            </View>
          </View>

          <Text style={styles.roleText}>{role}</Text>

          <View style={styles.statRow}>
            <Text style={styles.statText}>⛺ {campsCount} Camps Organized</Text>
          </View>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md
  },
  infoCol: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  name: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.h4,
    color: Colors.textPrimary
  },
  badge: {
    backgroundColor: Colors.infoBg,
    borderColor: Colors.info + '40',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm
  },
  badgeText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 10,
    color: Colors.info
  },
  roleText: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  statRow: {
    marginTop: Spacing.xs
  },
  statText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.success
  }
});

export default VolunteerCard;
