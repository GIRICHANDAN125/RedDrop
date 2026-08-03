import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { Colors, Typography, Radius, Spacing, BloodGroupColors } from '../../utils/theme';

const BloodBankCard = React.memo(({
  bloodBank,
  onPress,
  index = 0,
  style
}) => {
  if (!bloodBank) return null;

  const name = bloodBank.name || 'Blood Bank';
  const location = bloodBank.city || bloodBank.locationName || 'Blood Inventory Center';
  const stock = bloodBank.stock || bloodBank.inventory || {
    'A+': 12, 'A-': 4, 'B+': 18, 'B-': 2, 'AB+': 6, 'AB-': 1, 'O+': 24, 'O-': 5
  };
  const distanceKm = bloodBank.distance ? (bloodBank.distance / 1000).toFixed(1) : null;

  return (
    <Card onPress={onPress} index={index} style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.icon}>🏥</Text>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.subText}>
            📍 {location} {distanceKm ? `• ${distanceKm} km away` : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.stockTitle}>Real-time Available Stock</Text>
      
      <View style={styles.stockGrid}>
        {Object.entries(stock).map(([group, count]) => {
          const groupColor = BloodGroupColors[group] || Colors.primary;
          const isLow = count < 3;
          return (
            <View key={group} style={styles.stockPill}>
              <Text style={[styles.groupText, { color: groupColor }]}>{group}</Text>
              <Text style={[styles.countText, isLow && styles.lowStockText]}>{count}u</Text>
            </View>
          );
        })}
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
    gap: Spacing.sm,
    marginBottom: Spacing.sm
  },
  icon: {
    fontSize: 24
  },
  headerText: {
    flex: 1
  },
  name: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.h4,
    color: Colors.textPrimary
  },
  subText: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary
  },
  stockTitle: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    marginTop: 4
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCardSecondary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4
  },
  groupText: {
    fontFamily: Typography.headingSemibold,
    fontSize: 11
  },
  countText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 11,
    color: Colors.textPrimary
  },
  lowStockText: {
    color: Colors.warning
  }
});

export default BloodBankCard;
