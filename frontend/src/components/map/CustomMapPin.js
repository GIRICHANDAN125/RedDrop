import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors, Radius, Typography, BloodGroupColors } from '../../utils/theme';

const CustomMapPin = React.memo(({
  coordinate,
  type = 'donor', // 'donor' | 'hospital' | 'blood_bank' | 'camp'
  bloodGroup = 'O+',
  title = '',
  onPress
}) => {
  if (!coordinate) return null;

  const pinColors = {
    donor: BloodGroupColors[bloodGroup] || Colors.primary,
    hospital: Colors.info,
    blood_bank: Colors.warning,
    camp: Colors.success
  };

  const pinIcons = {
    donor: '🩸',
    hospital: '🏥',
    blood_bank: '🏦',
    camp: '⛺'
  };

  const mainColor = pinColors[type] || Colors.primary;
  const icon = pinIcons[type] || '📍';

  return (
    <Marker coordinate={coordinate} onPress={onPress} title={title}>
      <View style={[styles.pinWrapper, { borderColor: mainColor }]}>
        <Text style={styles.pinIcon}>{icon}</Text>
        {type === 'donor' && bloodGroup ? (
          <Text style={[styles.bloodGroupText, { color: mainColor }]}>{bloodGroup}</Text>
        ) : null}
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  pinWrapper: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  pinIcon: {
    fontSize: 14
  },
  bloodGroupText: {
    fontFamily: Typography.headingSemibold,
    fontSize: 11
  }
});

export default CustomMapPin;
