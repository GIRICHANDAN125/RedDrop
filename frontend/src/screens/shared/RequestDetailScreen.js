import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Linking
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { requestAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const EMERGENCY_COLORS = { critical: Colors.critical, high: Colors.high, medium: Colors.medium, low: Colors.low };

const STATUS_LABELS = {
  pending: { label: 'Pending Review', color: Colors.textMuted },
  searching: { label: 'Searching Donors', color: Colors.info },
  donor_found: { label: 'Donor Found', color: Colors.success },
  in_transit: { label: 'Blood In Transit', color: Colors.warning },
  at_hospital: { label: 'At Hospital', color: Colors.success },
  completed: { label: 'Completed', color: Colors.success },
  cancelled: { label: 'Cancelled', color: Colors.error },
  expired: { label: 'Expired', color: Colors.textMuted }
};

const RequestDetailScreen = ({ navigation, route }) => {
  const { id } = route.params || {};
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => { if (id) fetchRequest(); }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await requestAPI.getById(id);
      setRequest(res.data.request);
    } catch (e) {
      Alert.alert('Error', 'Failed to load request details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (action) => {
    Alert.alert(
      action === 'accept' ? '✅ Accept Request?' : '❌ Decline Request?',
      action === 'accept'
        ? 'By accepting, you commit to donating blood for this patient. Are you sure?'
        : 'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'accept' ? 'Accept' : 'Decline',
          style: action === 'accept' ? 'default' : 'destructive',
          onPress: async () => {
            setResponding(true);
            try {
              await requestAPI.respond(id, action);
              await fetchRequest();
              if (action === 'accept') {
                Alert.alert('🎉 Thank You!', "You've accepted the blood donation request. The patient's family has been notified.");
              }
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to respond.');
            } finally {
              setResponding(false);
            }
          }
        }
      ]
    );
  };

  const handleUpdateStatus = async (status) => {
    try {
      await requestAPI.updateStatus(id, { status });
      await fetchRequest();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const openMaps = () => {
    if (!request?.hospital?.location?.coordinates) return;
    const [lng, lat] = request.hospital.location.coordinates;
    const url = `https://maps.google.com/?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Colors.textMuted }}>Loading request...</Text>
      </View>
    );
  }

  if (!request) return null;

  const emergencyColor = EMERGENCY_COLORS[request.emergencyLevel] || Colors.primary;
  const statusInfo = STATUS_LABELS[request.status] || { label: request.status, color: Colors.textMuted };
  const isDonor = user?.role === 'donor';
  const isRequester = request.requester?._id === user?._id || request.requester === user?._id;
  const myDonorEntry = request.assignedDonors?.find(d => d.donor?.user?._id === user?._id || d.donor?.user === user?._id);
  const hasResponded = !!myDonorEntry;
  const canRespond = isDonor && !hasResponded && ['searching', 'pending'].includes(request.status);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.pageHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
          <Text style={styles.pageTitle}>Request Details</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TrackRequest', { requestId: id })}>
            <Text style={styles.trackText}>📍 Track</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Status Banner */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)}>
          <View style={[styles.statusBanner, { backgroundColor: emergencyColor + '15', borderColor: emergencyColor + '40' }]}>
            <View style={styles.statusLeft}>
              <View style={[styles.emergencyBadge, { backgroundColor: emergencyColor + '20', borderColor: emergencyColor + '50' }]}>
                <Text style={[styles.emergencyText, { color: emergencyColor }]}>{request.emergencyLevel?.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              </View>
            </View>
            <Text style={styles.requestId}>{request.requestId}</Text>
          </View>
        </Animated.View>

        {/* Patient Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card style={styles.section}>
            <View style={styles.patientRow}>
              <View style={styles.patientLeft}>
                <Text style={styles.sectionLabel}>Patient</Text>
                <Text style={styles.patientName}>{request.patientName}</Text>
                <View style={styles.unitsRow}>
                  <Text style={styles.unitsText}>🩸 {request.unitsRequired} units needed</Text>
                  {request.unitsFulfilled > 0 && (
                    <Text style={styles.fulfilledText}>({request.unitsFulfilled} fulfilled)</Text>
                  )}
                </View>
              </View>
              <BloodGroupBadge group={request.bloodGroup} size="xl" />
            </View>
          </Card>
        </Animated.View>

        {/* Hospital Info */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 Hospital</Text>
            <Text style={styles.hospitalName}>{request.hospital?.name}</Text>
            <Text style={styles.hospitalAddress}>
              {[request.hospital?.address, request.hospital?.city, request.hospital?.state].filter(Boolean).join(', ')}
            </Text>
            {request.hospital?.contactNumber && (
              <TouchableOpacity
                style={styles.callRow}
                onPress={() => Linking.openURL(`tel:${request.hospital.contactNumber}`)}
              >
                <Text style={styles.callText}>📞 {request.hospital.contactNumber}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.mapsBtn} onPress={openMaps}>
              <Text style={styles.mapsBtnText}>🗺️ Open in Maps</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* AI Analysis */}
        {request.aiAnalysis && (
          <Animated.View entering={FadeInDown.delay(180).duration(400)}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 AI Verification</Text>
              <View style={styles.aiRow}>
                <View style={styles.aiScore}>
                  <Text style={styles.aiScoreValue}>{100 - (request.aiAnalysis.fakeDetectionScore || 0)}%</Text>
                  <Text style={styles.aiScoreLabel}>Trust Score</Text>
                </View>
                <View style={styles.aiScore}>
                  <Text style={styles.aiScoreValue}>{request.aiAnalysis.urgencyScore || 0}%</Text>
                  <Text style={styles.aiScoreLabel}>Urgency Score</Text>
                </View>
                <View style={styles.aiScore}>
                  <Text style={[styles.aiScoreValue, { color: request.aiAnalysis.flags?.length ? Colors.warning : Colors.success }]}>
                    {request.aiAnalysis.flags?.length ? '⚠️' : '✅'}
                  </Text>
                  <Text style={styles.aiScoreLabel}>Flags</Text>
                </View>
              </View>
              {request.medicalReport?.aiVerification && (
                <View style={styles.reportVerif}>
                  <Text style={styles.reportVerifLabel}>Report Verification:</Text>
                  <Text style={[styles.reportVerifStatus, { color: request.medicalReport.aiVerification.isVerified ? Colors.success : Colors.warning }]}>
                    {request.medicalReport.aiVerification.isVerified ? '✅ Verified' : '⚠️ Unverified'} ({request.medicalReport.aiVerification.confidence}% confidence)
                  </Text>
                </View>
              )}
            </Card>
          </Animated.View>
        )}

        {/* Notes */}
        {request.notes && (
          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Notes</Text>
              <Text style={styles.notesText}>{request.notes}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Assigned Donors */}
        {request.assignedDonors?.length > 0 && (isRequester || isDonor) && (
          <Animated.View entering={FadeInDown.delay(260).duration(400)}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🤝 Donor Responses ({request.assignedDonors.length})</Text>
              {request.assignedDonors.map((entry, i) => (
                <View key={i} style={[styles.donorEntry, i > 0 && styles.donorEntryBorder]}>
                  <View style={styles.donorEntryLeft}>
                    <Text style={styles.donorEntryName}>{entry.donor?.user?.name || 'Donor'}</Text>
                    <Text style={styles.donorEntryUnits}>{entry.units} unit(s)</Text>
                  </View>
                  <View style={[styles.donorStatusBadge, {
                    backgroundColor: entry.status === 'accepted' ? Colors.successBg : Colors.warningBg,
                    borderColor: entry.status === 'accepted' ? Colors.success + '40' : Colors.warning + '40'
                  }]}>
                    <Text style={[styles.donorStatusText, { color: entry.status === 'accepted' ? Colors.success : Colors.warning }]}>
                      {entry.status}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(280).duration(400)} style={styles.actionsArea}>
          {canRespond && (
            <>
              <Button
                title="✅ Accept & Donate"
                onPress={() => handleRespond('accept')}
                loading={responding}
                size="lg"
                style={{ marginBottom: 12 }}
              />
              <Button
                title="Decline Request"
                onPress={() => handleRespond('decline')}
                variant="secondary"
                size="lg"
              />
            </>
          )}
          {hasResponded && (
            <Card variant={myDonorEntry?.status === 'accepted' ? 'success' : 'warning'} style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ fontFamily: 'Sora-SemiBold', fontSize: 15, color: myDonorEntry?.status === 'accepted' ? Colors.success : Colors.warning }}>
                {myDonorEntry?.status === 'accepted' ? '✅ You accepted this request' : '❌ You declined this request'}
              </Text>
            </Card>
          )}
          {isRequester && request.status === 'donor_found' && (
            <Button
              title="🚗 Mark Blood In Transit"
              onPress={() => handleUpdateStatus('in_transit')}
              size="lg"
              style={{ marginBottom: 12 }}
            />
          )}
          {isRequester && request.status === 'in_transit' && (
            <Button
              title="🏥 Mark Reached Hospital"
              onPress={() => handleUpdateStatus('at_hospital')}
              size="lg"
              style={{ marginBottom: 12 }}
            />
          )}
          {isRequester && request.status === 'at_hospital' && (
            <Button
              title="✅ Mark Completed"
              onPress={() => handleUpdateStatus('completed')}
              size="lg"
            />
          )}
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 20 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backText: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, paddingHorizontal: 4 },
  pageTitle: { fontFamily: 'Sora-Bold', fontSize: 19, color: Colors.textPrimary },
  trackText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.primary },
  statusBanner: { borderRadius: Radius.xl, borderWidth: 1, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusLeft: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  emergencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  emergencyText: { fontFamily: 'Sora-SemiBold', fontSize: 10, letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: Typography.bodyMedium, fontSize: 11 },
  requestId: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 14 },
  sectionLabel: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  patientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientLeft: { flex: 1 },
  patientName: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, marginBottom: 8 },
  unitsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitsText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  fulfilledText: { fontFamily: Typography.body, fontSize: 12, color: Colors.success },
  hospitalName: { fontFamily: 'Sora-SemiBold', fontSize: 17, color: Colors.textPrimary, marginBottom: 4 },
  hospitalAddress: { fontFamily: Typography.body, fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  callRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  callText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  mapsBtn: { backgroundColor: Colors.bgCardSecondary, borderRadius: Radius.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.glassBorder },
  mapsBtnText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  aiRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  aiScore: { alignItems: 'center' },
  aiScoreValue: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.primary, marginBottom: 4 },
  aiScoreLabel: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  reportVerif: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.divider },
  reportVerifLabel: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted },
  reportVerifStatus: { fontFamily: Typography.bodyMedium, fontSize: 12 },
  notesText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  donorEntry: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  donorEntryBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  donorEntryLeft: {},
  donorEntryName: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.textPrimary },
  donorEntryUnits: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  donorStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  donorStatusText: { fontFamily: Typography.bodyMedium, fontSize: 11 },
  actionsArea: { gap: 12 }
});

export default RequestDetailScreen;
