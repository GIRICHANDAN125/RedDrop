import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { api } from '../../api/client';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';
import Button from '../../components/common/Button';

const CampDiscoveryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [camps, setCamps] = useState([]);

  const fetchCamps = useCallback(async () => {
    try {
      const response = await api.get('/v2/camps');
      if (response.data?.success) {
        setCamps(response.data.data);
      }
    } catch (err) {
      console.error('Fetch camps error:', err.message);
      // Fallback data
      setCamps([
        {
          id: 1,
          title: 'Red Cross Community Donation Drive',
          city: 'Metropolis',
          location_name: 'Central City Hall Auditorium',
          start_time: '2026-08-10T09:00:00Z',
          target_units: 100,
          collected_units: 42,
          organizer_name: 'Red Cross Chapter'
        },
        {
          id: 2,
          title: 'University Youth Blood Drive',
          city: 'Metropolis',
          location_name: 'Campus Student Center',
          start_time: '2026-08-15T10:00:00Z',
          target_units: 50,
          collected_units: 15,
          organizer_name: 'Rotaract Club'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCamps();
  };

  const renderCampItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.campBadge}>UPCOMING DRIVE 🩸</Text>
        <Text style={styles.cityBadge}>{item.city}</Text>
      </View>
      <Text style={styles.campTitle}>{item.title}</Text>
      <Text style={styles.campLocation}>📍 {item.location_name}</Text>
      <Text style={styles.campTime}>🗓️ {new Date(item.start_time).toLocaleDateString()}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Goal: {item.target_units} Units</Text>
          <Text style={styles.progressText}>{item.collected_units || 0} Collected</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, ((item.collected_units || 0) / (item.target_units || 1)) * 100)}%` }
            ]}
          />
        </View>
      </View>

      <Button
        title="Register to Donate"
        variant="outline"
        size="small"
        onPress={() => alert(`Registered for ${item.title}!`)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donation Camps ⛺</Text>
        <Text style={styles.subtitle}>Discover nearby voluntary blood donation drives</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={camps}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCampItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No upcoming donation camps found nearby.</Text>
            </View>
          }
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.lg },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.glassBorder
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  campBadge: { fontSize: 11, fontFamily: Typography.caption, color: Colors.primary, letterSpacing: 1 },
  cityBadge: { fontSize: 11, fontFamily: Typography.caption, color: Colors.textMuted },
  campTitle: { fontSize: 17, fontFamily: Typography.heading, color: Colors.textPrimary, marginBottom: Spacing.xs },
  campLocation: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4, fontFamily: Typography.body },
  campTime: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.md, fontFamily: Typography.body },
  progressContainer: { marginBottom: Spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressText: { fontSize: 11, color: Colors.textMuted, fontFamily: Typography.caption },
  progressBarBg: { height: 6, backgroundColor: Colors.bgDark, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary },
  emptyContainer: { padding: Spacing.xxl, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', fontFamily: Typography.body }
});

export default CampDiscoveryScreen;
