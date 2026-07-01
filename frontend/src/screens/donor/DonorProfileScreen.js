import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { donorAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const BADGE_INFO = {
  first_donor: { icon: '🩸', label: 'First Donation', desc: 'Completed first donation' },
  hero: { icon: '🦸', label: 'Hero', desc: '5+ donations' },
  lifesaver: { icon: '❤️', label: 'Life Saver', desc: '10+ donations' },
  veteran: { icon: '⭐', label: 'Veteran', desc: '25+ donations' },
  emergency_hero: { icon: '🚨', label: 'Emergency Hero', desc: 'Critical request donor' }
};

const DonorProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await donorAPI.getProfile();
      setDonor(res.data.donor);
      setIsAvailable(res.data.donor.availability?.isAvailable ?? true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (val) => {
    setIsAvailable(val);
    try {
      await donorAPI.toggleAvailability({ isAvailable: val });
    } catch {
      setIsAvailable(!val);
      Alert.alert('Error', 'Failed to update availability.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Colors.textMuted }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Donor Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile card */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Card style={styles.profileCard} variant="primary" glow>
            <View style={styles.profileTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.[0] || '?'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profilePhone}>{user?.phone}</Text>
                {user?.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified Donor</Text>
                  </View>
                )}
              </View>
              <BloodGroupBadge group={donor?.bloodGroup || user?.bloodGroup} size="lg" />
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { value: donor?.stats?.totalDonations || 0, label: 'Donations' },
                { value: `${donor?.stats?.responseRate || 100}%`, label: 'Response' },
                { value: donor?.stats?.livesSaved || 0, label: 'Lives Saved' }
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Availability toggle */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)}>
          <Card style={styles.availCard}>
            <View style={styles.availRow}>
              <View>
                <Text style={styles.availTitle}>Available for Donation</Text>
                <Text style={styles.availSubtitle}>
                  {isAvailable ? 'Donors nearby will see you as available' : 'You are marked as unavailable'}
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={handleToggleAvailability}
                trackColor={{ false: Colors.bgCardSecondary, true: Colors.primaryGlow }}
                thumbColor={isAvailable ? Colors.primary : Colors.textMuted}
              />
            </View>
            {!isAvailable && (
              <View style={styles.unavailNote}>
                <Text style={styles.unavailNoteText}>
                  💡 Remember to mark yourself available after 90 days from last donation
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Medical Info */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🩺 Medical Information</Text>
            {[
              { label: 'Last Donation', value: donor?.medicalHistory?.lastDonationDate ? new Date(donor.medicalHistory.lastDonationDate).toLocaleDateString('en-IN') : 'Not recorded' },
              { label: 'Hemoglobin', value: donor?.medicalHistory?.hemoglobinLevel ? `${donor.medicalHistory.hemoglobinLevel} g/dL` : 'Not recorded' },
              { label: 'Weight', value: donor?.medicalHistory?.weight ? `${donor.medicalHistory.weight} kg` : 'Not recorded' },
              { label: 'Eligible to Donate', value: donor?.medicalHistory?.isFitToDonate ? '✅ Yes' : '❌ No' }
            ].map((item, i) => (
              <View key={i} style={[styles.infoRow, i < 3 && styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🏅 Achievements</Text>
              <View style={styles.badgesGrid}>
                {user.badges.map(badge => {
                  const info = BADGE_INFO[badge];
                  if (!info) return null;
                  return (
                    <View key={badge} style={styles.badgeItem}>
                      <Text style={styles.badgeIcon}>{info.icon}</Text>
                      <Text style={styles.badgeLabel}>{info.label}</Text>
                      <Text style={styles.badgeDesc}>{info.desc}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Location */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Service Area</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationIcon}>🏙️</Text>
              <View>
                <Text style={styles.locationCity}>{donor?.location?.city || 'Not set'}, {donor?.location?.state || ''}</Text>
                <Text style={styles.locationRadius}>Serving within {donor?.maxDistanceKm || 20} km</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backText: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, paddingHorizontal: 4 },
  headerTitle: { fontFamily: 'Sora-Bold', fontSize: 19, color: Colors.textPrimary },
  editText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  profileCard: { marginBottom: 16 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryGlow, borderWidth: 2, borderColor: Colors.primary + '40', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Sora-Bold', fontSize: 24, color: Colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Sora-Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 2 },
  profilePhone: { fontFamily: Typography.body, fontSize: 13, color: Colors.textMuted, marginBottom: 6 },
  verifiedBadge: { backgroundColor: Colors.successBg, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.success + '40' },
  verifiedText: { fontFamily: Typography.bodyMedium, fontSize: 11, color: Colors.success },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'Sora-Bold', fontSize: 20, color: Colors.primary },
  statLabel: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  availCard: { marginBottom: 16 },
  availRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availTitle: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 4 },
  availSubtitle: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, maxWidth: '80%' },
  unavailNote: { marginTop: 12, backgroundColor: Colors.warningBg, borderRadius: Radius.md, padding: 10, borderWidth: 1, borderColor: Colors.warning + '30' },
  unavailNoteText: { fontFamily: Typography.body, fontSize: 12, color: Colors.warning },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  infoLabel: { fontFamily: Typography.body, fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textPrimary },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeItem: { backgroundColor: Colors.bgCardSecondary, borderRadius: Radius.lg, padding: 12, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: Colors.glassBorder },
  badgeIcon: { fontSize: 24, marginBottom: 6 },
  badgeLabel: { fontFamily: Typography.bodyMedium, fontSize: 11, color: Colors.textPrimary, textAlign: 'center' },
  badgeDesc: { fontFamily: Typography.body, fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationIcon: { fontSize: 28 },
  locationCity: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  locationRadius: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted }
});

export default DonorProfileScreen;
