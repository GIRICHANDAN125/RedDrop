import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withRepeat, withTiming, withSequence
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius } from '../../utils/theme';

const { width } = Dimensions.get('window');

const EmergencyAlertBanner = ({ request, onPress, onDismiss }) => {
  const translateY = useSharedValue(-100);
  const glow = useSharedValue(0);

  useEffect(() => {
    // Slide in
    translateY.value = withSpring(0, { damping: 15 });
    // Pulse glow
    glow.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    // Haptic alert
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Auto dismiss after 8 seconds
    const timer = setTimeout(() => {
      translateY.value = withSpring(-120);
      setTimeout(onDismiss, 500);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.2 + glow.value * 0.3
  }));

  const handleDismiss = () => {
    translateY.value = withSpring(-120);
    setTimeout(onDismiss, 400);
  };

  return (
    <Animated.View style={[styles.container, animStyle, glowStyle]}>
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.pulseIndicator}>
          <View style={styles.pulseDot} />
        </View>
        <View style={styles.textSection}>
          <Text style={styles.alertTitle}>🚨 CRITICAL BLOOD REQUEST NEARBY</Text>
          <Text style={styles.alertBody} numberOfLines={1}>
            {request?.bloodGroup} needed • {request?.hospital?.name}, {request?.hospital?.city}
          </Text>
          <Text style={styles.alertSub}>{request?.unitsRequired} unit{request?.unitsRequired > 1 ? 's' : ''} required • Tap to respond</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={styles.progressBar}>
        <Animated.View style={styles.progressFill} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999,
    backgroundColor: Colors.criticalBg, borderBottomWidth: 1.5,
    borderBottomColor: Colors.critical + '80',
    shadowColor: Colors.critical, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20, elevation: 20
  },
  content: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 52, paddingBottom: 14, gap: 12
  },
  pulseIndicator: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.critical + '30',
    alignItems: 'center', justifyContent: 'center'
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.critical },
  textSection: { flex: 1 },
  alertTitle: { fontFamily: 'Sora-Bold', fontSize: 11, color: Colors.critical, letterSpacing: 1, marginBottom: 2 },
  alertBody: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  alertSub: { fontFamily: Typography.body, fontSize: 11, color: Colors.textSecondary },
  closeBtn: { padding: 4 },
  closeText: { fontFamily: Typography.body, fontSize: 16, color: Colors.textMuted },
  progressBar: { height: 2, backgroundColor: Colors.critical + '30', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.critical, width: '100%' }
});

export default EmergencyAlertBanner;
