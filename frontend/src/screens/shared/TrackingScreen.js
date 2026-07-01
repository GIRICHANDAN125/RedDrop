import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { trackingAPI } from '../../api/client';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const TRACKING_STEPS = [
  { key: 'pending',      icon: '📋', label: 'Request Created',   desc: 'Your request has been submitted' },
  { key: 'searching',   icon: '🔍', label: 'Finding Donors',     desc: 'Searching nearby donors' },
  { key: 'donor_found', icon: '🤝', label: 'Donor Found',        desc: 'A donor has accepted' },
  { key: 'in_transit',  icon: '🚗', label: 'Blood In Transit',   desc: 'On the way to hospital' },
  { key: 'at_hospital', icon: '🏥', label: 'Reached Hospital',   desc: 'Blood arrived at hospital' },
  { key: 'completed',   icon: '✅', label: 'Completed',          desc: 'Transfusion completed' }
];

const STATUS_ORDER = TRACKING_STEPS.map(s => s.key);

const TrackingScreen = ({ navigation, route }) => {
  const { requestId } = route.params || {};
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: pulseAnim.value
  }));

  useEffect(() => {
    if (requestId) fetchTracking();
  }, [requestId]);

  useEffect(() => {
    // Pulse animation for active step
    pulseAnim.value = withRepeat(withTiming(1.15, { duration: 900 }), -1, true);
  }, []);

  const fetchTracking = async () => {
    try {
      const res = await trackingAPI.getTracking(requestId);
      setTracking(res.data.tracking);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = tracking ? STATUS_ORDER.indexOf(tracking.status) : 0;

  const getStepState = (stepKey) => {
    const stepIdx = STATUS_ORDER.indexOf(stepKey);
    if (stepIdx < currentStepIndex) return 'done';
    if (stepIdx === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.pageHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
          <Text style={styles.pageTitle}>Track Request</Text>
          <View style={{ width: 32 }} />
        </Animated.View>

        {!requestId ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyTitle}>No Request Selected</Text>
              <Text style={styles.emptyText}>Go to a blood request and tap "Track" to see live status</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Requests')}>
                <Text style={styles.emptyBtnText}>View My Requests →</Text>
              </TouchableOpacity>
            </Card>
          </Animated.View>
        ) : loading ? (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading tracking info...</Text>
          </Card>
        ) : tracking ? (
          <>
            {/* Request Info */}
            <Animated.View entering={FadeInDown.delay(80).duration(400)}>
              <Card style={styles.requestInfoCard} variant="primary">
                <View style={styles.requestInfoRow}>
                  <View>
                    <Text style={styles.requestIdLabel}>Request ID</Text>
                    <Text style={styles.requestIdValue}>{tracking.requestId}</Text>
                    <Text style={styles.requestPatient}>{tracking.patientName}</Text>
                  </View>
                  <BloodGroupBadge group={tracking.bloodGroup} size="lg" />
                </View>
                <View style={styles.hospitalRow}>
                  <Text style={styles.hospitalIcon}>🏥</Text>
                  <Text style={styles.hospitalName}>{tracking.hospital?.name}</Text>
                </View>
              </Card>
            </Animated.View>

            {/* Live Status */}
            <Animated.View entering={FadeInDown.delay(120).duration(400)}>
              <Card style={styles.statusCard}>
                <Text style={styles.sectionTitle}>Live Status</Text>
                {TRACKING_STEPS.map((step, i) => {
                  const state = getStepState(step.key);
                  const isActive = state === 'active';
                  const isDone = state === 'done';
                  return (
                    <View key={step.key} style={styles.timelineItem}>
                      {/* Line */}
                      {i < TRACKING_STEPS.length - 1 && (
                        <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />
                      )}
                      {/* Dot */}
                      <Animated.View style={[
                        styles.timelineDot,
                        isDone && styles.timelineDotDone,
                        isActive && styles.timelineDotActive,
                        isActive && pulseStyle
                      ]}>
                        <Text style={styles.timelineDotIcon}>{isDone ? '✓' : step.icon}</Text>
                      </Animated.View>
                      {/* Content */}
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineLabel, (isDone || isActive) && styles.timelineLabelActive]}>
                          {step.label}
                        </Text>
                        <Text style={styles.timelineDesc}>{step.desc}</Text>
                        {isActive && (
                          <View style={styles.activeBadge}>
                            <View style={styles.activeDot} />
                            <Text style={styles.activeBadgeText}>In Progress</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </Card>
            </Animated.View>

            {/* Timeline History */}
            {tracking.timeline?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(160).duration(400)}>
                <Card style={styles.historyCard}>
                  <Text style={styles.sectionTitle}>Activity Log</Text>
                  {tracking.timeline.map((item, i) => (
                    <View key={i} style={styles.historyItem}>
                      <View style={styles.historyDot} />
                      <View style={styles.historyContent}>
                        <Text style={styles.historyStatus}>{item.status?.replace(/_/g, ' ').toUpperCase()}</Text>
                        <Text style={styles.historyNote}>{item.note}</Text>
                        <Text style={styles.historyTime}>{formatTime(item.timestamp)}</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </Animated.View>
            )}
          </>
        ) : (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❓</Text>
            <Text style={styles.emptyTitle}>Request Not Found</Text>
          </Card>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 20 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backText: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, paddingHorizontal: 4 },
  pageTitle: { fontFamily: 'Sora-Bold', fontSize: 19, color: Colors.textPrimary },
  sectionTitle: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 20 },
  requestInfoCard: { marginBottom: 16 },
  requestInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  requestIdLabel: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  requestIdValue: { fontFamily: 'Sora-Bold', fontSize: 15, color: Colors.primary, marginBottom: 4 },
  requestPatient: { fontFamily: 'Sora-SemiBold', fontSize: 16, color: Colors.textPrimary },
  hospitalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hospitalIcon: { fontSize: 14 },
  hospitalName: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  statusCard: { marginBottom: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, position: 'relative' },
  timelineLine: { position: 'absolute', left: 19, top: 40, width: 2, height: 32, backgroundColor: Colors.divider },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineDot: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCardSecondary,
    borderWidth: 2, borderColor: Colors.glassBorder, alignItems: 'center', justifyContent: 'center', marginRight: 14
  },
  timelineDotDone: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  timelineDotActive: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary, borderWidth: 3 },
  timelineDotIcon: { fontSize: 16 },
  timelineContent: { flex: 1, paddingTop: 6 },
  timelineLabel: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.textMuted, marginBottom: 2 },
  timelineLabelActive: { color: Colors.textPrimary },
  timelineDesc: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: Colors.primaryGlow, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.primary + '40' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  activeBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 11, color: Colors.primary },
  historyCard: { marginBottom: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 5, marginRight: 12 },
  historyContent: { flex: 1 },
  historyStatus: { fontFamily: 'Sora-SemiBold', fontSize: 12, color: Colors.primary, letterSpacing: 0.5, marginBottom: 2 },
  historyNote: { fontFamily: Typography.body, fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  historyTime: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Sora-SemiBold', fontSize: 18, color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  emptyBtn: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.lg, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: Colors.primary + '40' },
  emptyBtnText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  loadingCard: { alignItems: 'center', padding: 32, marginTop: 20 },
  loadingText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textMuted }
});

export default TrackingScreen;
