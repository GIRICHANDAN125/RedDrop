import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Card from '../common/Card';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const HospitalCard = React.memo(({
  hospital,
  onPress,
  onCall,
  index = 0,
  style
}) => {
  if (!hospital) return null;

  const name = hospital.name || 'Hospital';
  const city = hospital.city || hospital.address?.city || '';
  const phone = hospital.phone || hospital.contactPhone;
  const isVerified = hospital.isVerified ?? true;
  const distanceKm = hospital.distance ? (hospital.distance / 1000).toFixed(1) : null;
  const lat = hospital.location?.coordinates?.[1] || hospital.latitude;
  const lng = hospital.location?.coordinates?.[0] || hospital.longitude;

  const handleCall = () => {
    if (onCall) {
      onCall(hospital);
    } else if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleOpenMaps = () => {
    if (lat && lng) {
      Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
    }
  };

  return (
    <Card onPress={onPress} index={index} style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.hospitalIcon}>🏥</Text>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.addressText} numberOfLines={2}>
        📍 {city ? `${city}` : 'Emergency Blood Center'} {distanceKm ? `• ${distanceKm} km away` : ''}
      </Text>

      <View style={styles.actions}>
        {phone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Call ${name}`}
          >
            <Text style={styles.btnIcon}>📞</Text>
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        )}

        {(lat && lng) && (
          <TouchableOpacity
            style={styles.mapsBtn}
            onPress={handleOpenMaps}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open maps navigation"
          >
            <Text style={styles.btnIcon}>🗺️</Text>
            <Text style={styles.mapsBtnText}>Directions</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs
  },
  hospitalIcon: {
    fontSize: 18
  },
  name: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.h4,
    color: Colors.textPrimary,
    flex: 1
  },
  verifiedBadge: {
    backgroundColor: Colors.infoBg,
    borderColor: Colors.info + '60',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  verifiedIcon: {
    fontSize: 10,
    color: Colors.info,
    fontWeight: 'bold'
  },
  addressText: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCardSecondary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md
  },
  btnIcon: {
    fontSize: 12,
    marginRight: 4
  },
  callBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.primary
  },
  mapsBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary
  }
});

export default HospitalCard;
