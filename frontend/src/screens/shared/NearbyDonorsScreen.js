import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, Dimensions
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { donorAPI } from '../../api/client';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius, BloodGroupColors } from '../../utils/theme';

const { height } = Dimensions.get('window');
const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const NearbyDonorsScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [donors, setDonors] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

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
        limit: 30
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

  const focusDonor = (donor) => {
    setSelectedDonor(donor);
    if (donor.location?.coordinates && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: donor.location.coordinates[1],
        longitude: donor.location.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    }
  };

  const mapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#0a0a0f' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#a0a0b8' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0f' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a28' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Donors</Text>
        <TouchableOpacity style={styles.viewToggle} onPress={() => setViewMode(v => v === 'map' ? 'list' : 'map')}>
          <Text style={styles.viewToggleText}>{viewMode === 'map' ? '☰ List' : '🗺 Map'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Blood Group Filter */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.filterRow}>
        <FlatList
          horizontal
          data={BLOOD_GROUPS}
          keyExtractor={i => i}
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

      {viewMode === 'map' && location ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={mapStyle}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            }}
          >
            {/* User location */}
            <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
              <View style={styles.myMarker}><Text style={styles.myMarkerIcon}>📍</Text></View>
            </Marker>
            <Circle
              center={{ latitude: location.latitude, longitude: location.longitude }}
              radius={20000}
              fillColor="rgba(230,57,70,0.04)"
              strokeColor="rgba(230,57,70,0.2)"
              strokeWidth={1}
            />

            {/* Donor markers */}
            {donors.map((donor, i) => {
              if (!donor.location?.coordinates) return null;
              const [lng, lat] = donor.location.coordinates;
              const color = BloodGroupColors[donor.bloodGroup] || Colors.primary;
              return (
                <Marker
                  key={donor._id || i}
                  coordinate={{ latitude: lat, longitude: lng }}
                  onPress={() => focusDonor(donor)}
                >
                  <View style={[styles.donorMarker, { borderColor: color }]}>
                    <Text style={[styles.donorMarkerText, { color }]}>{donor.bloodGroup}</Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Donor count badge */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{donors.length} donors found</Text>
          </View>

          {/* Selected donor card */}
          {selectedDonor && (
            <Animated.View entering={SlideInUp.duration(300)} style={styles.donorPreview}>
              <DonorCard donor={selectedDonor} onContact={() => {}} onDismiss={() => setSelectedDonor(null)} />
            </Animated.View>
          )}
        </View>
      ) : (
        <FlatList
          data={donors}
          keyExtractor={(item, i) => item._id || String(i)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No donors found nearby{selectedGroup !== 'All' ? ` with ${selectedGroup}` : ''}</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
              <DonorCard donor={item} onContact={() => {}} onDismiss={null} />
            </Animated.View>
          )}
        />
      )}
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
  viewToggle: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.glassBorder },
  viewToggleText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.textSecondary },
  filterRow: { paddingBottom: 12 },
  filterList: { paddingHorizontal: Spacing.screen, gap: 8 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.glassBorder, backgroundColor: Colors.bgCard },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  filterChipText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.primary },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  myMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryGlow, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  myMarkerIcon: { fontSize: 18 },
  donorMarker: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 2 },
  donorMarkerText: { fontFamily: 'Sora-Bold', fontSize: 11 },
  countBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: Colors.glassBorder },
  countText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.textPrimary },
  donorPreview: { position: 'absolute', bottom: 20, left: Spacing.screen, right: Spacing.screen },
  listContent: { paddingHorizontal: Spacing.screen, paddingBottom: 80 },
  donorCard: { marginBottom: 12 },
  donorCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  donorAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  donorAvatarText: { fontFamily: 'Sora-Bold', fontSize: 18, color: Colors.textPrimary },
  donorInfo: { flex: 1 },
  donorName: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  donorCity: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  donorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  donorMetaText: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  donorActions: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, backgroundColor: Colors.primaryGlow, borderRadius: Radius.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '40' },
  contactBtnText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.primary },
  dismissBtn: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.bgCardSecondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
  dismissBtnText: { fontFamily: Typography.body, fontSize: 16, color: Colors.textMuted },
  emptyList: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textMuted, textAlign: 'center' }
});

export default NearbyDonorsScreen;
