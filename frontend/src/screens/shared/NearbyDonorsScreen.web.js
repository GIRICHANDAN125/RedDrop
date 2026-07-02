import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { donorAPI } from '../../api/client';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius, BloodGroupColors } from '../../utils/theme';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const NearbyDonorsScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [donors, setDonors] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocationAndDonors();
  }, []);

  const getLocationAndDonors = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);
      await fetchDonors(loc.coords, selectedGroup);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonors = async (coords, bg) => {
    try {
      const params = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        maxDistance: 20000,
        limit: 30,
      };
      if (bg && bg !== 'All') params.bloodGroup = bg;
      const res = await donorAPI.getNearby(params);
      setDonors(res.data.donors || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGroupFilter = async (bg) => {
    setSelectedGroup(bg);
    if (location) {
      setLoading(true);
      await fetchDonors(location, bg);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Donors</Text>
        <View style={styles.webBadge}>
          <Text style={styles.webBadgeText}>Web</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.filterRow}>
        <FlatList
          horizontal
          data={BLOOD_GROUPS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedGroup === item && styles.filterChipActive]}
              onPress={() => handleGroupFilter(item)}
            >
              <Text style={[styles.filterChipText, selectedGroup === item && styles.filterChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Map view is native-only</Text>
        <Text style={styles.noticeBody}>
          The browser build uses the donor list below, so Metro does not load the native map dependency.
        </Text>
      </View>

      <FlatList
        data={donors}
        keyExtractor={(item, i) => item._id || String(i)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              {loading
                ? 'Loading nearby donors...'
                : `No donors found nearby${selectedGroup !== 'All' ? ` with ${selectedGroup}` : ''}`}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
            <DonorCard donor={item} onContact={() => {}} onDismiss={null} />
          </Animated.View>
        )}
      />
    </View>
  );
};

const DonorCard = ({ donor, onContact, onDismiss }) => {
  const color = BloodGroupColors[donor.bloodGroup] || Colors.primary;
  return (
    <Card style={styles.donorCard}>
      <View style={styles.donorCardRow}>
        <View style={[styles.donorAvatar, { backgroundColor: color + '20', borderColor: color + '40' }]}>
          <Text style={styles.donorAvatarText}>{donor.user?.name?.[0] || '?'}</Text>
        </View>
        <View style={styles.donorInfo}>
          <Text style={styles.donorName}>{donor.user?.name || 'Anonymous Donor'}</Text>
          <Text style={styles.donorCity}>{donor.location?.city || 'Unknown location'}</Text>
          <View style={styles.donorMeta}>
            <View style={[styles.availDot, { backgroundColor: donor.availability?.isAvailable ? Colors.success : Colors.textMuted }]} />
            <Text style={styles.donorMetaText}>{donor.stats?.totalDonations || 0} donations</Text>
            {donor.stats?.responseRate && <Text style={styles.donorMetaText}>• {donor.stats.responseRate}% response</Text>}
          </View>
        </View>
        <BloodGroupBadge group={donor.bloodGroup} size="md" />
      </View>
      <View style={styles.donorActions}>
        <TouchableOpacity style={styles.contactBtn} onPress={onContact}>
          <Text style={styles.contactBtnText}>📞 Contact</Text>
        </TouchableOpacity>
        {onDismiss && (
          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 16 },
  backText: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, paddingHorizontal: 4 },
  headerTitle: { fontFamily: 'Sora-Bold', fontSize: 19, color: Colors.textPrimary },
  webBadge: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.glassBorder },
  webBadgeText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.textSecondary },
  filterRow: { paddingBottom: 12 },
  filterList: { paddingHorizontal: Spacing.screen, gap: 8 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.glassBorder, backgroundColor: Colors.bgCard },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  filterChipText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.primary },
  noticeCard: { marginHorizontal: Spacing.screen, marginBottom: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.glassBorder },
  noticeTitle: { fontFamily: 'Sora-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 4 },
  noticeBody: { fontFamily: Typography.body, fontSize: 12, lineHeight: 18, color: Colors.textSecondary },
  listContent: { paddingHorizontal: Spacing.screen, paddingBottom: 80 },
  emptyList: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  donorCard: { marginBottom: 12 },
  donorCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  donorAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  donorAvatarText: { fontFamily: 'Sora-Bold', fontSize: 18, color: Colors.textPrimary },
  donorInfo: { flex: 1 },
  donorName: { fontFamily: 'Sora-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  donorCity: { fontFamily: Typography.body, fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  donorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  donorMetaText: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  donorActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center' },
  contactBtnText: { fontFamily: Typography.bodyBold, fontSize: 13, color: '#fff' },
  dismissBtn: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  dismissBtnText: { fontSize: 16, color: Colors.textSecondary },
});

export default NearbyDonorsScreen;