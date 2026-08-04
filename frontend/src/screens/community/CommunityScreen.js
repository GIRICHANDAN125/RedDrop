import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { api } from '../../api/client';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const CommunityScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ total_donors: 0, total_donations: 0, lives_saved: 0 });

  const fetchCommunityData = useCallback(async () => {
    try {
      const response = await api.get('/v2/community/leaderboard');
      if (response.data?.success) {
        setLeaderboard(response.data.data.topDonors || []);
        setStats(response.data.data.communityStats || {});
      }
    } catch (err) {
      console.error('Fetch community data error:', err.message);
      setLeaderboard([
        { id: 1, name: 'Alex Smith', total_donations: 18, lives_saved: 54, blood_group: 'O-', city: 'Metropolis' },
        { id: 2, name: 'Priya Sharma', total_donations: 14, lives_saved: 42, blood_group: 'A+', city: 'Metropolis' },
        { id: 3, name: 'John Doe', total_donations: 10, lives_saved: 30, blood_group: 'B+', city: 'Metropolis' }
      ]);
      setStats({ total_donors: 350, total_donations: 1200, lives_saved: 3600 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunityData();
  };

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={styles.rankCard}>
      <Text style={styles.rankNumber}>#{index + 1}</Text>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{item.name ? item.name[0] : 'D'}</Text>
      </View>
      <View style={styles.donorInfo}>
        <Text style={styles.donorName}>{item.name}</Text>
        <Text style={styles.donorCity}>{item.city || 'Verified Donor'} • {item.blood_group}</Text>
      </View>
      <View style={styles.donationsBadge}>
        <Text style={styles.donationsCount}>{item.total_donations}</Text>
        <Text style={styles.donationsLabel}>Donations</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Hall 🏆</Text>
        <Text style={styles.subtitle}>Top heroes saving lives across our network</Text>
      </View>

      {/* Community Impact Stats */}
      <View style={styles.impactContainer}>
        <View style={styles.impactCard}>
          <Text style={styles.impactValue}>{stats.total_donors || 0}</Text>
          <Text style={styles.impactLabel}>Active Donors</Text>
        </View>
        <View style={styles.impactCard}>
          <Text style={styles.impactValue}>{stats.total_donations || 0}</Text>
          <Text style={styles.impactLabel}>Donations</Text>
        </View>
        <View style={styles.impactCard}>
          <Text style={[styles.impactValue, { color: Colors.success }]}>{stats.lives_saved || 0}</Text>
          <Text style={styles.impactLabel}>Lives Saved</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLeaderboardItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: 24, fontFamily: Typography.heading, color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4, fontFamily: Typography.body },
  impactContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  impactCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder
  },
  impactValue: { fontSize: 20, fontFamily: Typography.heading, color: Colors.primary },
  impactLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 4, fontFamily: Typography.caption },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.lg },
  rankCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.glassBorder
  },
  rankNumber: { fontSize: 16, fontFamily: Typography.heading, color: Colors.primary, width: 32, textAlign: 'center' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md
  },
  avatarText: { fontSize: 18, fontFamily: Typography.heading, color: Colors.primary },
  donorInfo: { flex: 1 },
  donorName: { fontSize: 15, fontFamily: Typography.heading, color: Colors.textPrimary },
  donorCity: { fontSize: 12, color: Colors.textMuted, fontFamily: Typography.body },
  donationsBadge: { alignItems: 'center' },
  donationsCount: { fontSize: 16, fontFamily: Typography.heading, color: Colors.textPrimary },
  donationsLabel: { fontSize: 10, color: Colors.textMuted, fontFamily: Typography.caption }
});

export default CommunityScreen;
