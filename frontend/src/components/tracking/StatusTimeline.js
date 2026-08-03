import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Card from '../common/Card';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

export const DEFAULT_TRACKING_STEPS = [
  { key: 'pending',      icon: '📋', label: 'Request Created',   desc: 'Your request has been submitted' },
  { key: 'searching',   icon: '🔍', label: 'Finding Donors',     desc: 'Searching nearby donors' },
  { key: 'donor_found', icon: '🤝', label: 'Donor Found',        desc: 'A donor has accepted' },
  { key: 'in_transit',  icon: '🚗', label: 'Blood In Transit',   desc: 'On the way to hospital' },
  { key: 'at_hospital', icon: '🏥', label: 'Reached Hospital',   desc: 'Blood arrived at hospital' },
  { key: 'completed',   icon: '✅', label: 'Completed',          desc: 'Transfusion completed' }
];

const STATUS_ORDER = DEFAULT_TRACKING_STEPS.map(s => s.key);

const StatusTimeline = React.memo(({
  currentStep = 'searching',
  steps = DEFAULT_TRACKING_STEPS,
  activityLog = [],
  style
}) => {
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withTiming(1.18, { duration: 900 }),
      -1,
      true
    );
  }, []);

  const activePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value
  }));

  const currentIdx = STATUS_ORDER.indexOf(currentStep) >= 0 ? STATUS_ORDER.indexOf(currentStep) : 0;

  const getStepState = (key) => {
    const idx = STATUS_ORDER.indexOf(key);
    if (idx < currentIdx) return 'done';
    if (idx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <Card style={[styles.card, style]}>
      {steps.map((step, index) => {
        const state = getStepState(step.key);
        const isLast = index === steps.length - 1;

        return (
          <View key={step.key} style={styles.stepContainer}>
            {/* Left timeline indicator column */}
            <View style={styles.timelineCol}>
              {state === 'done' ? (
                <View style={styles.doneDot}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              ) : state === 'active' ? (
                <Animated.View style={[styles.activeDot, activePulseStyle]}>
                  <View style={styles.innerDot} />
                </Animated.View>
              ) : (
                <View style={styles.pendingDot} />
              )}

              {!isLast && (
                <View style={[styles.line, state === 'done' ? styles.doneLine : styles.pendingLine]} />
              )}
            </View>

            {/* Right content column */}
            <View style={styles.contentCol}>
              <View style={styles.labelRow}>
                <Text style={styles.icon}>{step.icon}</Text>
                <Text
                  style={[
                    styles.stepLabel,
                    state === 'done' && styles.doneLabel,
                    state === 'active' && styles.activeLabel,
                    state === 'pending' && styles.pendingLabel
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.xs
  },
  timelineCol: {
    alignItems: 'center',
    width: 28
  },
  doneDot: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkIcon: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: 'bold'
  },
  activeDot: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary
  },
  pendingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.bgCardSecondary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginTop: 4
  },
  line: {
    width: 2,
    height: 36,
    marginVertical: 4
  },
  doneLine: {
    backgroundColor: Colors.success
  },
  pendingLine: {
    backgroundColor: Colors.glassBorder
  },
  contentCol: {
    flex: 1,
    paddingBottom: Spacing.md
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2
  },
  icon: {
    fontSize: 16
  },
  stepLabel: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.body
  },
  doneLabel: {
    color: Colors.textPrimary
  },
  activeLabel: {
    color: Colors.primary
  },
  pendingLabel: {
    color: Colors.textMuted
  },
  stepDesc: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginLeft: 24
  }
});

export default StatusTimeline;
