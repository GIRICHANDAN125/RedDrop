import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, StatusBar, Alert
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import { requestAPI } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMERGENCY_LEVELS = [
  { id: 'critical', label: '🚨 Critical', desc: 'Life threatening, immediate', color: Colors.critical },
  { id: 'high', label: '❗ High', desc: 'Urgent, within hours', color: Colors.high },
  { id: 'medium', label: '⚠️ Medium', desc: 'Needed within a day', color: Colors.medium },
  { id: 'low', label: 'ℹ️ Low', desc: 'Planned / non-urgent', color: Colors.low }
];

const CreateRequestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [reportFile, setReportFile] = useState(null);
  const [form, setForm] = useState({
    patientName: '', bloodGroup: 'O+', unitsRequired: '1',
    emergencyLevel: 'high',
    hospital: { name: '', city: '', address: '', contactNumber: '' },
    notes: ''
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateHospital = (key, value) => setForm(prev => ({ ...prev, hospital: { ...prev.hospital, [key]: value } }));

  const pickReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) setReportFile(result.assets[0]);
    } catch { Alert.alert('Error', 'Failed to pick file.'); }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission denied', 'Location access needed.'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync(loc.coords);
      if (place) {
        updateHospital('city', place.city || place.subregion || '');
        updateHospital('address', `${place.street || ''} ${place.district || ''}`.trim());
      }
    } catch { Alert.alert('Error', 'Could not get location.'); }
  };

  const validate = () => {
    const e = {};
    if (!form.patientName.trim()) e.patientName = 'Patient name is required';
    if (!form.hospital.name.trim()) e.hospitalName = 'Hospital name is required';
    if (!form.hospital.city.trim()) e.hospitalCity = 'City is required';
    const units = parseInt(form.unitsRequired);
    if (!units || units < 1 || units > 10) e.units = 'Units must be between 1 and 10';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, unitsRequired: parseInt(form.unitsRequired) };
      const res = await requestAPI.create(payload);
      const requestId = res.data.request._id;
      if (reportFile) {
        const fd = new FormData();
        fd.append('report', { uri: reportFile.uri, name: reportFile.name, type: reportFile.mimeType });
        await requestAPI.uploadReport(requestId, fd);
      }
      Alert.alert('✅ Request Created!', `ID: ${res.data.request.requestId}`, [
        { text: 'Track Status', onPress: () => navigation.replace('RequestDetail', { id: requestId }) }
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create request.';
      Alert.alert('Error', msg);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(400)} style={styles.pageHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
            <Text style={styles.pageTitle}>Request Blood</Text>
            <View style={{ width: 32 }} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Patient Information</Text>
              <Input label="Patient Name" placeholder="Full name of patient" value={form.patientName}
                onChangeText={v => update('patientName', v)} autoCapitalize="words" error={errors.patientName} />
              <Text style={styles.fieldLabel}>Blood Group Needed</Text>
              <View style={styles.bloodGrid}>
                {BLOOD_GROUPS.map(bg => (
                  <TouchableOpacity key={bg} style={[styles.bgChip, form.bloodGroup === bg && styles.bgChipActive]} onPress={() => update('bloodGroup', bg)}>
                    <Text style={[styles.bgChipText, form.bloodGroup === bg && styles.bgChipTextActive]}>{bg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Units Required" placeholder="1–10" value={form.unitsRequired}
                onChangeText={v => update('unitsRequired', v)} keyboardType="number-pad" error={errors.units} />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(400)}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🚨 Emergency Level</Text>
              <View style={styles.levelGrid}>
                {EMERGENCY_LEVELS.map(level => (
                  <TouchableOpacity key={level.id}
                    style={[styles.levelCard, form.emergencyLevel === level.id && { borderColor: level.color, backgroundColor: level.color + '15' }]}
                    onPress={() => update('emergencyLevel', level.id)}>
                    <Text style={styles.levelLabel}>{level.label}</Text>
                    <Text style={styles.levelDesc}>{level.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(400)}>
            <Card style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>🏥 Hospital Details</Text>
                <TouchableOpacity onPress={getLocation} style={styles.locationBtn}>
                  <Text style={styles.locationBtnText}>📍 Auto-fill</Text>
                </TouchableOpacity>
              </View>
              <Input label="Hospital Name" placeholder="e.g. AIIMS Delhi" value={form.hospital.name}
                onChangeText={v => updateHospital('name', v)} autoCapitalize="words" error={errors.hospitalName} />
              <Input label="City" placeholder="e.g. New Delhi" value={form.hospital.city}
                onChangeText={v => updateHospital('city', v)} autoCapitalize="words" error={errors.hospitalCity} />
              <Input label="Address (optional)" placeholder="Ward / floor details" value={form.hospital.address}
                onChangeText={v => updateHospital('address', v)} autoCapitalize="sentences" />
              <Input label="Contact Number (optional)" placeholder="Hospital helpdesk" value={form.hospital.contactNumber}
                onChangeText={v => updateHospital('contactNumber', v)} keyboardType="phone-pad" />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>📄 Medical Report (Optional)</Text>
              <Text style={styles.sectionSubtitle}>Upload a prescription or report to boost trust score</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={pickReport}>
                {reportFile ? (
                  <View style={styles.fileSelected}>
                    <Text style={styles.fileIcon}>📎</Text>
                    <Text style={styles.fileName} numberOfLines={1}>{reportFile.name}</Text>
                    <TouchableOpacity onPress={() => setReportFile(null)}><Text style={styles.removeFile}>✕</Text></TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>⬆️</Text>
                    <Text style={styles.uploadText}>Tap to upload PDF or image</Text>
                    <Text style={styles.uploadHint}>Max 5MB • PDF, JPG, PNG</Text>
                  </>
                )}
              </TouchableOpacity>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(400)}>
            <View style={styles.aiNotice}>
              <Text style={styles.aiNoticeIcon}>🤖</Text>
              <Text style={styles.aiNoticeText}>AI will analyze this request for verification before alerting donors.</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(400)}>
            <Button title="Submit Blood Request 🩸" onPress={handleSubmit} loading={loading} size="lg" />
          </Animated.View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 20 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backText: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, paddingHorizontal: 4 },
  pageTitle: { fontFamily: 'Sora-Bold', fontSize: 19, color: Colors.textPrimary },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },
  sectionSubtitle: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, marginBottom: 12, marginTop: -8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  fieldLabel: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  bgChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.glassBorder, backgroundColor: Colors.bgCardSecondary },
  bgChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  bgChipText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  bgChipTextActive: { color: Colors.primary },
  levelGrid: { gap: 10 },
  levelCard: { padding: 14, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.glassBorder, backgroundColor: Colors.bgCardSecondary },
  levelLabel: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  levelDesc: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted },
  locationBtn: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.primary + '30' },
  locationBtnText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.primary },
  uploadBox: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.glassBorder, borderRadius: Radius.lg, padding: 24, alignItems: 'center', backgroundColor: Colors.bgCardSecondary },
  uploadIcon: { fontSize: 28, marginBottom: 8 },
  uploadText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  uploadHint: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted },
  fileSelected: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileIcon: { fontSize: 20 },
  fileName: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.primary, flex: 1 },
  removeFile: { fontSize: 16, color: Colors.error, paddingHorizontal: 4 },
  aiNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.infoBg, borderRadius: Radius.lg, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: Colors.info + '30' },
  aiNoticeIcon: { fontSize: 18 },
  aiNoticeText: { fontFamily: Typography.body, fontSize: 12, color: Colors.info, flex: 1, lineHeight: 18 }
});

export default CreateRequestScreen;
