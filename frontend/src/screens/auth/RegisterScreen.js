import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, StatusBar
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const ROLES = [
  { id: 'donor', icon: '🩸', label: 'Blood Donor', desc: 'I want to donate blood' },
  { id: 'receiver', icon: '🏥', label: 'Patient / Family', desc: 'I need blood for someone' },
  { id: 'hospital', icon: '🏨', label: 'Hospital', desc: 'I represent a hospital' }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: 'donor', bloodGroup: 'O+'
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit Indian mobile required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.password || form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleRegister = async () => {
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) {
      if (result.requiresVerification) {
        navigation.navigate('OTPVerification', { email: form.email, purpose: 'email_verify' });
      }
    } else {
      setErrors({ general: result.error });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />

      {/* Background */}
      <View style={styles.bgBlob} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.steps}>
              {[1,2,3].map(s => (
                <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
            <Text style={styles.title}>
              {step === 1 ? 'Create account' : step === 2 ? 'Set password' : 'Choose your role'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Join the Red Drop AI network' : step === 2 ? 'Keep your account secure' : 'How will you use Red Drop AI?'}
            </Text>

            {errors.general && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {errors.general}</Text>
              </View>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <>
                <Input label="Full Name" placeholder="John Doe" value={form.name}
                  onChangeText={v => update('name', v)} autoCapitalize="words" error={errors.name}
                  icon={<Text style={{ fontSize: 16 }}>👤</Text>} />
                <Input label="Email" placeholder="you@example.com" value={form.email}
                  onChangeText={v => update('email', v)} keyboardType="email-address" error={errors.email}
                  icon={<Text style={{ fontSize: 16 }}>✉️</Text>} />
                <Input label="Mobile Number" placeholder="9876543210" value={form.phone}
                  onChangeText={v => update('phone', v)} keyboardType="phone-pad" error={errors.phone}
                  icon={<Text style={{ fontSize: 16 }}>📱</Text>} />
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <Input label="Password" placeholder="Min 8 characters" value={form.password}
                  onChangeText={v => update('password', v)} secureTextEntry error={errors.password}
                  icon={<Text style={{ fontSize: 16 }}>🔒</Text>} />
                <Input label="Confirm Password" placeholder="Re-enter password" value={form.confirmPassword}
                  onChangeText={v => update('confirmPassword', v)} secureTextEntry error={errors.confirmPassword}
                  icon={<Text style={{ fontSize: 16 }}>🔒</Text>} />
                <View style={styles.passwordHints}>
                  {['8+ characters', 'Mix of letters & numbers', 'One special character'].map((hint, i) => (
                    <View key={i} style={styles.hintRow}>
                      <Text style={[styles.hintDot, form.password.length >= 8 && i === 0 && styles.hintDotGreen]}>•</Text>
                      <Text style={styles.hintText}>{hint}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <View style={styles.rolesGrid}>
                  {ROLES.map(role => (
                    <TouchableOpacity
                      key={role.id}
                      style={[styles.roleCard, form.role === role.id && styles.roleCardActive]}
                      onPress={() => update('role', role.id)}
                    >
                      <Text style={styles.roleIcon}>{role.icon}</Text>
                      <Text style={[styles.roleLabel, form.role === role.id && styles.roleLabelActive]}>
                        {role.label}
                      </Text>
                      <Text style={styles.roleDesc}>{role.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {form.role === 'donor' && (
                  <>
                    <Text style={styles.sectionLabel}>Your Blood Group</Text>
                    <View style={styles.bloodGrid}>
                      {BLOOD_GROUPS.map(bg => (
                        <TouchableOpacity
                          key={bg}
                          style={[styles.bgChip, form.bloodGroup === bg && styles.bgChipActive]}
                          onPress={() => update('bloodGroup', bg)}
                        >
                          <Text style={[styles.bgChipText, form.bloodGroup === bg && styles.bgChipTextActive]}>
                            {bg}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            {step < 3 ? (
              <Button title="Continue →" onPress={handleNext} size="lg" style={{ marginTop: 8 }} />
            ) : (
              <Button title="Create Account 🩸" onPress={handleRegister} loading={loading} size="lg" style={{ marginTop: 8 }} />
            )}

            {step === 1 && (
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  bgBlob: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 300,
    backgroundColor: Colors.primary, opacity: 0.03
  },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: { padding: 4 },
  backText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  steps: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  stepDotActive: { backgroundColor: Colors.primary, width: 24 },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius['2xl'],
    borderWidth: 1, borderColor: Colors.glassBorder, padding: 28
  },
  title: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary, marginBottom: 28 },
  errorBanner: {
    backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: Colors.error + '40'
  },
  errorText: { fontFamily: Typography.body, fontSize: 13, color: Colors.error },
  passwordHints: { marginTop: 8, marginBottom: 8 },
  hintRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hintDot: { fontSize: 18, color: Colors.textMuted, marginRight: 8 },
  hintDotGreen: { color: Colors.success },
  hintText: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted },
  rolesGrid: { gap: 12, marginBottom: 20 },
  roleCard: {
    padding: 16, borderRadius: Radius.lg, borderWidth: 1.5,
    borderColor: Colors.glassBorder, backgroundColor: Colors.bgCardSecondary
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  roleIcon: { fontSize: 28, marginBottom: 8 },
  roleLabel: { fontFamily: 'Sora-SemiBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 2 },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted },
  sectionLabel: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary, marginBottom: 12, marginTop: 4 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  bgChip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.glassBorder, backgroundColor: Colors.bgCardSecondary
  },
  bgChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  bgChipText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.textSecondary },
  bgChipTextActive: { color: Colors.primary },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary }
});

export default RegisterScreen;
