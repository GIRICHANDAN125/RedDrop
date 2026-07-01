import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Switch
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Edit Profile', screen: 'EditProfile' },
        { icon: '🔒', label: 'Change Password', screen: 'ChangePassword' },
        { icon: '📱', label: 'Verify Phone', screen: 'VerifyPhone' },
        ...(user?.role === 'donor' ? [{ icon: '🩸', label: 'Donor Profile', screen: 'DonorProfile' }] : [])
      ]
    },
    {
      title: 'Activity',
      items: [
        { icon: '📋', label: 'My Requests', screen: 'MyRequests' },
        { icon: '🏅', label: 'Badges & Achievements', screen: 'Achievements' },
        { icon: '📊', label: 'Donation History', screen: 'DonationHistory' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help & FAQ', screen: 'Help' },
        { icon: '📞', label: 'Contact Support', screen: 'Support' },
        { icon: '🛡️', label: 'Privacy Policy', screen: 'Privacy' },
        { icon: '📄', label: 'Terms of Service', screen: 'Terms' }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Card style={styles.profileCard} variant="primary" glow>
            <View style={styles.profileTop}>
              <View style={styles.avatarWrap}>
                {user?.avatar?.url ? null : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarLetter}>{user?.name?.[0] || '?'}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.avatarEditBtn}>
                  <Text style={styles.avatarEditIcon}>📷</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>{user?.name}</Text>
                  {user?.isVerified && <Text style={styles.verifiedIcon}>✓</Text>}
                </View>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <Text style={styles.profilePhone}>{user?.phone}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>
              </View>
              {user?.bloodGroup && <BloodGroupBadge group={user.bloodGroup} size="md" />}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { value: user?.totalDonations || 0, label: 'Donations' },
                { value: user?.badges?.length || 0, label: 'Badges' },
                { value: user?.rating?.average?.toFixed(1) || '—', label: 'Rating' }
              ].map((s, i) => (
                <View key={i} style={[styles.statItem, i < 2 && styles.statItemBorder]}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)}>
          <Card style={styles.prefsCard}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Text style={styles.prefIcon}>🔔</Text>
                <View>
                  <Text style={styles.prefLabel}>Push Notifications</Text>
                  <Text style={styles.prefDesc}>Alerts for nearby requests</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.bgCardSecondary, true: Colors.primaryGlow }}
                thumbColor={notifications ? Colors.primary : Colors.textMuted}
              />
            </View>
            <View style={[styles.prefRow, { borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 12 }]}>
              <View style={styles.prefLeft}>
                <Text style={styles.prefIcon}>🌙</Text>
                <View>
                  <Text style={styles.prefLabel}>Dark Mode</Text>
                  <Text style={styles.prefDesc}>Always on in Red Drop AI</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.bgCardSecondary, true: Colors.primaryGlow }}
                thumbColor={darkMode ? Colors.primary : Colors.textMuted}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <Animated.View key={si} entering={FadeInDown.delay((si + 2) * 80).duration(400)}>
            <Card style={styles.menuCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.menuItem, ii < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconWrap}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.menuChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </Card>
          </Animated.View>
        ))}

        {/* App Version */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>🩸 Red Drop AI v1.0.0</Text>
          <Text style={styles.versionSub}>Built with ❤️ for India</Text>
        </View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontFamily: 'Sora-Bold', fontSize: 26, color: Colors.textPrimary },
  notifBtn: { padding: 4 },
  notifIcon: { fontSize: 22 },
  profileCard: { marginBottom: 16 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryGlow,
    borderWidth: 2, borderColor: Colors.primary + '40', alignItems: 'center', justifyContent: 'center'
  },
  avatarLetter: { fontFamily: 'Sora-Bold', fontSize: 26, color: Colors.primary },
  avatarEditBtn: {
    position: 'absolute', bottom: -2, right: -2, width: 22, height: 22,
    borderRadius: 11, backgroundColor: Colors.bgDark, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder
  },
  avatarEditIcon: { fontSize: 10 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  profileName: { fontFamily: 'Sora-Bold', fontSize: 17, color: Colors.textPrimary },
  verifiedIcon: { fontSize: 14, color: Colors.success },
  profileEmail: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  profilePhone: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryGlow,
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.primary + '30'
  },
  roleText: { fontFamily: 'Sora-SemiBold', fontSize: 10, color: Colors.primary, letterSpacing: 1 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statItemBorder: { borderRightWidth: 1, borderRightColor: Colors.divider },
  statValue: { fontFamily: 'Sora-Bold', fontSize: 20, color: Colors.primary },
  statLabel: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  prefsCard: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.textMuted, marginBottom: 16, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11 },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefIcon: { fontSize: 20 },
  prefLabel: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.textPrimary },
  prefDesc: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  menuCard: { marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bgCardSecondary, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 17 },
  menuLabel: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.textPrimary },
  menuChevron: { fontFamily: Typography.body, fontSize: 22, color: Colors.textMuted },
  versionRow: { alignItems: 'center', marginBottom: 20 },
  versionText: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted },
  versionSub: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.errorBg, borderRadius: Radius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.error + '40'
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.error }
});

export default ProfileScreen;
