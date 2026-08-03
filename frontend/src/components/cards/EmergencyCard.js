import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';
import BloodGroupBadge from '../common/BloodGroupBadge';
import { Colors, Typography, Radius, Spacing, EmergencyColors } from '../../utils/theme';

const EmergencyCard = React.memo(({
  request,
  onPress,
  onRespond,
  index = 0,
  style
}) => {
  if (!request) return null;

  const emergencyLevel = request.emergencyLevel || 'medium';
  const eColor = EmergencyColors[emergencyLevel] || Colors.primary;
  const isCritical = emergencyLevel === 'critical';

  return (
    <Card
      onPress={onPress}
      variant={isCritical ? 'critical' : 'default'}
      glow={isCritical}
      index={index}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.urgencyBadge, { backgroundColor: eColor + '20', borderColor: eColor + '50' }]}>
            <Text style={[styles.urgencyText, { color: eColor }]}>
              {emergencyLevel.toUpperCase()}
            </Text>
          </View>
          {request.status && (
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: request.status === 'searching' ? Colors.info : Colors.success }]} />
              <Text style={styles.statusText}>{request.status.replace(/_/g, ' ')}</Text>
            </View>
          )}
        </View>

        <BloodGroupBadge group={request.bloodGroup} size="sm" />
      </View>

      <Text style={styles.patientName}>{request.patientName || 'Emergency Patient'}</Text>
      
      <Text style={styles.hospitalText} numberOfLines={1}>
        🏥 {request.hospital?.name || 'Local Hospital'}{request.hospital?.city ? `, ${request.hospital.city}` : ''}
      </Text>

      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          <Text style={styles.unitsText}>💧 {request.unitsNeeded || 1} Units Needed</Text>
        </View>

        {onRespond && (
          <TouchableOpacity
            style={[styles.respondBtn, { backgroundColor: eColor }]}
            onPress={(e) => {
              e.stopPropagation?.();
              onRespond(request);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Respond to request"
          >
            <Text style={styles.respondBtnText}>Respond</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1
  },
  urgencyText: {
    fontFamily: Typography.headingSemibold,
    fontSize: 10,
    letterSpacing: 0.5
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4
  },
  statusText: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'capitalize'
  },
  patientName: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.h4,
    color: Colors.textPrimary,
    marginVertical: 4
  },
  hospitalText: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  unitsText: {
    fontFamily: Typography.bodyMedium,
    fontSize: Typography.sizes.caption,
    color: Colors.textPrimary
  },
  respondBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md
  },
  respondBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textPrimary
  }
});

export default EmergencyCard;
