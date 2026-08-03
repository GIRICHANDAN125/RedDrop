import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

const StatCard = React.memo(({
  icon = '📊',
  value = 0,
  label = 'Metric',
  color = Colors.primary,
  onPress,
  index = 0,
  style
}) => {
  return (
    <Card onPress={onPress} index={index} style={[styles.card, style]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '20', borderColor: color + '40' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    padding: Spacing.md,
    alignItems: 'center'
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs
  },
  icon: {
    fontSize: 18
  },
  value: {
    fontFamily: Typography.heading,
    fontSize: Typography.sizes.h2,
    marginVertical: 2
  },
  label: {
    fontFamily: Typography.bodyMedium,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center'
  }
});

export default StatCard;
