import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, SlideInRight } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { requestAPI } from '../../api/client';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const { width } = Dimensions.get('window');

const EMERGENCY_COLORS = {
  critical: Colors.critical,
  high: Colors.high,
  medium: Colors.medium,
  low: Colors.low
};

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await requestAPI.getAll({ limit: 5, status: 'searching' });
      setRequests(res.data.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const isDonor = user?.role === 'donor';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.headerSub}>
              {isDonor ? 'Thank you for saving lives' : 'Find blood donors near you'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Donor Status Card */}
        {isDonor && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Card style={styles.availabilityCard} variant="primary" glow>
              <View style={styles.availRow}>
                <View>
                  <Text style={styles.availTitle}>Your Donor Status</Text>
                  <View style={styles.availStatusRow}>
                    <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                    <Text style={[styles.availStatus, { color: Colors.success }]}>Available to donate</Text>
                  </View>
                </View>
                <BloodGroupBadge group={user?.bloodGroup} size="lg" />
              </View>
              <TouchableOpacity style={styles.toggleBtn} onPress={() => navigation.navigate('DonorProfile')}>
                <Text style={styles.toggleBtnText}>Manage Availability →</Text>
              </TouchableOpacity>
            </Card>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '🩸', label: 'Request\nBlood', color: Colors.primary, screen: 'CreateRequest' },
              { icon: '🔍', label: 'Find\nDonors', color: '#4361EE', screen: 'NearbyDonors' },
              { icon: '📍', label: 'Track\nBlood', color: Colors.success, screen: 'TrackRequest' },
              { icon: '🏥', label: 'Hospitals\nNearby', color: Colors.warning, screen: 'Hospitals' }
            ].map((action, i) => (
              <Animated.View key={action.label} entering={FadeInRight.delay(i * 80).duration(400)}>
                <TouchableOpacity
                  style={[styles.actionCard, { borderColor: action.color + '40' }]}
                  onPress={() => navigation.navigate(action.screen)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: action.color + '20' }]}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>Network Stats</Text>
          <View style={styles.statsRow}>
            {[
              { icon: '🩸', value: '2.4M+', label: 'Donors', color: Colors.primary },
              { icon: '❤️', value: '89K+', label: 'Lives Saved', color: Colors.success },
              { icon: '🏥', value: '650+', label: 'Hospitals', color: '#4361EE' }
            ].map((stat, i) => (
              <Card key={i} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </Animated.View>

        {/* Emergency Requests */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {requests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>No active emergency requests nearby</Text>
            </Card>
          ) : (
            requests.map((req, i) => (
              <Animated.View key={req._id} entering={SlideInRight.delay(i * 80).duration(400)}>
                <Card
                  style={styles.requestCard}
                  onPress={() => navigation.navigate('RequestDetail', { id: req._id })}
                >
                  <View style={styles.requestHeader}>
                    <View style={[styles.emergencyBadge, {
                      backgroundColor: (EMERGENCY_COLORS[req.emergencyLevel] || Colors.primary) + '20',
                      borderColor: (EMERGENCY_COLORS[req.emergencyLevel] || Colors.primary) + '50'
                    }]}>
                      <Text style={[styles.emergencyText, { color: EMERGENCY_COLORS[req.emergencyLevel] || Colors.primary }]}>
                        {req.emergencyLevel?.toUpperCase()}
                      </Text>
                    </View>
                    <BloodGroupBadge group={req.bloodGroup} size="sm" />
                  </View>
                  <Text style={styles.requestPatient}>{req.patientName}</Text>
                  <Text style={styles.requestHospital}>🏥 {req.hospital?.name}, {req.hospital?.city}</Text>
                  <View style={styles.requestFooter}>
                    <Text style={styles.requestUnits}>🩸 {req.unitsRequired} units needed</Text>
                    <Text style={styles.requestTime}>{timeAgo(req.createdAt)}</Text>
                  </View>
                </Card>
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Tip Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Card variant="primary" style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Did You Know?</Text>
            <Text style={styles.tipText}>
              One blood donation can save up to 3 lives. Donors can give every 90 days. Your next donation could be someone's last hope.
            </Text>
            <Text style={styles.tipLink}>Learn more about donation →</Text>
          </Card>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary },
  headerSub: { fontFamily: Typography.body, fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  notifBtn: { position: 'relative', padding: 4 },
  notifIcon: { fontSize: 22 },
  notifBadge: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  availabilityCard: { marginBottom: 24 },
  availRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  availTitle: { fontFamily: 'Sora-SemiBold', fontSize: 16, color: Colors.textPrimary, marginBottom: 6 },
  availStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  availStatus: { fontFamily: Typography.bodyMedium, fontSize: 13 },
  toggleBtn: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '30' },
  toggleBtnText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.primary },
  sectionTitle: { fontFamily: 'Sora-SemiBold', fontSize: 17, color: Colors.textPrimary, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.primary },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  actionCard: { width: (width - 40 - 12) / 2, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1, padding: 18, alignItems: 'flex-start' },
  actionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontFamily: 'Sora-SemiBold', fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontFamily: 'Sora-Bold', fontSize: 16 },
  statLabel: { fontFamily: Typography.body, fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  requestCard: { marginBottom: 12 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  emergencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  emergencyText: { fontFamily: 'Sora-SemiBold', fontSize: 10, letterSpacing: 1 },
  requestPatient: { fontFamily: 'Sora-SemiBold', fontSize: 16, color: Colors.textPrimary, marginBottom: 4 },
  requestHospital: { fontFamily: Typography.body, fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestUnits: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.textMuted },
  requestTime: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  tipCard: { marginBottom: 12 },
  tipTitle: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 8 },
  tipText: { fontFamily: Typography.body, fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  tipLink: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.primary }
});

export default HomeScreen;
