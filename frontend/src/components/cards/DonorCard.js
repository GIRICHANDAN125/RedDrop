import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import BloodGroupBadge from '../common/BloodGroupBadge';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const DonorCard = React.memo(({
  donor,
  onPress,
  onContact,
  onDismiss,
  index = 0,
  style
}) => {
  if (!donor) return null;

  // Normalize flat SQL vs nested Mongoose/GeoJSON models
  const name = donor.name || donor.user?.name || 'Blood Donor';
  const phone = donor.phone || donor.user?.phone;
  const avatarUrl = donor.avatar?.url || donor.user?.avatar?.url;
  const isVerified = donor.isVerified || donor.user?.isVerified || false;
  const bloodGroup = donor.bloodGroup || donor.user?.bloodGroup || 'O+';
  const totalDonations = donor.totalDonations ?? donor.donorProfile?.totalDonations ?? 0;
  const isAvailable = donor.availability?.isAvailable ?? true;
  const distanceKm = donor.distance ? (donor.distance / 1000).toFixed(1) : null;

  const handleCall = () => {
    if (onContact) {
      onContact(donor);
    } else if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <Card onPress={onPress} index={index} style={[styles.card, style]}>
      <View style={styles.contentRow}>
        <Avatar url={avatarUrl} name={name} size="md" isVerified={isVerified} />

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={[styles.statusDot, { backgroundColor: isAvailable ? Colors.success : Colors.textMuted }]} />
          </View>

          <Text style={styles.subText}>
            {totalDonations} {totalDonations === 1 ? 'Donation' : 'Donations'}
            {distanceKm ? ` • ${distanceKm} km away` : ''}
          </Text>
        </View>

        <BloodGroupBadge group={bloodGroup} size="sm" />
      </View>

      <View style={styles.actionRow}>
        {phone && (
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={handleCall}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Call ${name}`}
          >
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>Call Donor</Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => onDismiss(donor)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Dismiss donor"
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        )}
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
    gap: 6
  },
  name: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.h4,
    color: Colors.textPrimary
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  subText: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md
  },
  contactIcon: {
    fontSize: 12,
    marginRight: 4
  },
  contactText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.primary
  },
  dismissBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md
  },
  dismissText: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted
  }
});

export default DonorCard;
