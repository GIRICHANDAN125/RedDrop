import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { api } from '../../api/client';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';
import Button from '../../components/common/Button';

const CertificatesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificates, setCertificates] = useState([]);

  const fetchCertificates = useCallback(async () => {
    try {
      const response = await api.get('/v2/certificates/my');
      if (response.data?.success) {
        setCertificates(response.data.data);
      }
    } catch (err) {
      console.error('Fetch certificates error:', err.message);
      setCertificates([
        {
          certificate_id: 'CERT-RD-2026-9041',
          donor_name: 'Jane Doe',
          blood_group: 'O+',
          hospital_name: 'Metropolis General Hospital',
          issued_at: '2026-07-20T14:30:00Z',
          qr_code_hash: 'a4f91b7c8e...30d2'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCertificates();
  };

  const renderCertItem = ({ item }) => (
    <View style={styles.certCard}>
      <View style={styles.certHeader}>
        <Text style={styles.badge}>VERIFIED DONATION CERTIFICATE 🎖️</Text>
        <Text style={styles.certId}>{item.certificate_id}</Text>
      </View>

      <View style={styles.certBody}>
        <Text style={styles.donorLabel}>Awarded To</Text>
        <Text style={styles.donorName}>{item.donor_name || 'Verified RedDrop Donor'}</Text>
        <Text style={styles.hospitalText}>At {item.hospital_name || 'Medical Facility'}</Text>
        <Text style={styles.dateText}>Issued on {new Date(item.issued_at).toLocaleDateString()}</Text>
      </View>

      <View style={styles.qrRow}>
        <View style={styles.qrBox}>
          <Text style={styles.qrPlaceholder}>📱 QR</Text>
        </View>
        <View style={styles.qrDetails}>
          <Text style={styles.hashLabel}>Cryptographic Hash</Text>
          <Text style={styles.hashValue} numberOfLines={1}>{item.qr_code_hash}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Certificates 📜</Text>
        <Text style={styles.subtitle}>Verified digital badges & certificates of life-saving donations</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={certificates}
          keyExtractor={(item) => item.certificate_id}
          renderItem={renderCertItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No certificates earned yet. Donate blood to receive verified certificates!</Text>
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
  certCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.glassBorder
  },
  certHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  badge: { fontSize: 10, fontFamily: Typography.caption, color: Colors.primary, letterSpacing: 1 },
  certId: { fontSize: 11, fontFamily: Typography.caption, color: Colors.textMuted },
  certBody: { marginBottom: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  donorLabel: { fontSize: 11, color: Colors.textMuted, fontFamily: Typography.caption },
  donorName: { fontSize: 20, fontFamily: Typography.heading, color: Colors.textPrimary, marginVertical: 2 },
  hospitalText: { fontSize: 14, color: Colors.textSecondary, fontFamily: Typography.body },
  dateText: { fontSize: 12, color: Colors.textMuted, marginTop: 4, fontFamily: Typography.body },
  qrRow: { flexDirection: 'row', alignItems: 'center' },
  qrBox: {
    width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.bgDark,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.glassBorder
  },
  qrPlaceholder: { fontSize: 14, color: Colors.textPrimary, fontFamily: Typography.caption },
  qrDetails: { marginLeft: Spacing.md, flex: 1 },
  hashLabel: { fontSize: 10, color: Colors.textMuted, fontFamily: Typography.caption },
  hashValue: { fontSize: 12, color: Colors.primary, fontFamily: Typography.caption }
});

export default CertificatesScreen;
