import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar
} from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { requestAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const EMERGENCY_COLORS = { critical: Colors.critical, high: Colors.high, medium: Colors.medium, low: Colors.low };
const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUS_FILTERS = ['All', 'Searching', 'Donor Found', 'In Transit', 'Completed'];

const RequestsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRequests = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const params = { page: currentPage, limit: 15 };
      if (activeFilter !== 'All') params.emergencyLevel = activeFilter.toLowerCase();
      const res = await requestAPI.getAll(params);
      const newRequests = res.data.requests || [];
      if (reset) {
        setRequests(newRequests);
        setPage(2);
      } else {
        setRequests(prev => [...prev, ...newRequests]);
        setPage(prev => prev + 1);
      }
      setHasMore(newRequests.length === 15);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(true); }, [activeFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests(true);
    setRefreshing(false);
  }, [activeFilter]);

  const renderRequest = ({ item, index }) => {
    const eColor = EMERGENCY_COLORS[item.emergencyLevel] || Colors.primary;
    return (
      <Animated.View entering={SlideInRight.delay(Math.min(index, 5) * 60).duration(350)}>
        <Card
          style={styles.requestCard}
          onPress={() => navigation.navigate('RequestDetail', { id: item._id })}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <View style={[styles.emergencyBadge, { backgroundColor: eColor + '20', borderColor: eColor + '50' }]}>
                <Text style={[styles.emergencyText, { color: eColor }]}>{item.emergencyLevel?.toUpperCase()}</Text>
              </View>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: item.status === 'searching' ? Colors.info : item.status === 'completed' ? Colors.success : Colors.warning }]} />
                <Text style={styles.statusText}>{item.status?.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <BloodGroupBadge group={item.bloodGroup} size="sm" />
          </View>

          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.hospitalText}>🏥 {item.hospital?.name}, {item.hospital?.city}</Text>

          <View style={styles.cardBottom}>
            <Text style={styles.unitsText}>🩸 {item.unitsRequired} unit{item.unitsRequired > 1 ? 's' : ''}</Text>
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>

          {/* Progress bar for fulfilled units */}
          {item.unitsFulfilled > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(item.unitsFulfilled / item.unitsRequired) * 100}%` }]} />
            </View>
          )}
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Requests</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateRequest')}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Filters */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.filtersWrap}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* List */}
      <FlatList
        data={requests}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={renderRequest}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        onEndReached={() => hasMore && !loading && fetchRequests()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No requests found</Text>
              <Text style={styles.emptyText}>
                {activeFilter !== 'All' ? `No ${activeFilter.toLowerCase()} requests available` : 'No blood requests in your area'}
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('CreateRequest')}
              >
                <Text style={styles.emptyBtnText}>Create a Request</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

function timeAgo(date) {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 16 },
  backText: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, paddingHorizontal: 4 },
  headerTitle: { fontFamily: 'Sora-Bold', fontSize: 19, color: Colors.textPrimary },
  addBtn: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: Colors.primary + '40' },
  addBtnText: { fontFamily: 'Sora-SemiBold', fontSize: 13, color: Colors.primary },
  filtersWrap: { paddingBottom: 12 },
  filtersList: { paddingHorizontal: Spacing.screen, gap: 8 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.glassBorder, backgroundColor: Colors.bgCard },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  filterText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.primary },
  listContent: { paddingHorizontal: Spacing.screen, paddingBottom: 80 },
  requestCard: { marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTopLeft: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  emergencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  emergencyText: { fontFamily: 'Sora-SemiBold', fontSize: 10, letterSpacing: 1 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.bgCardSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontFamily: Typography.body, fontSize: 10, color: Colors.textSecondary },
  patientName: { fontFamily: 'Sora-SemiBold', fontSize: 17, color: Colors.textPrimary, marginBottom: 4 },
  hospitalText: { fontFamily: Typography.body, fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unitsText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.textMuted },
  timeText: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  progressBar: { height: 3, backgroundColor: Colors.divider, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 2 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Sora-SemiBold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.lg, paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: Colors.primary + '40' },
  emptyBtnText: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.primary }
});

export default RequestsScreen;
