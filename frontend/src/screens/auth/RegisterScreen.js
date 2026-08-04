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

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password
    });
    setLoading(false);

    if (result.success) {
      if (result.requiresVerification) {
        navigation.navigate('OTPVerification', { email: form.email, purpose: 'email_verify' });
      } else {
        navigation.navigate('Main');
      }
    } else {
      setErrors({ general: result.error || 'Registration failed.' });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />

      <View style={styles.bgBlob} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
            <Text style={styles.title}>Create Account 🩸</Text>
            <Text style={styles.subtitle}>Join Red Drop AI network in seconds</Text>

            {errors.general && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {errors.general}</Text>
              </View>
            )}

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChangeText={v => update('name', v)}
              autoCapitalize="words"
              error={errors.name}
              icon={<Text style={{ fontSize: 16 }}>👤</Text>}
            />

            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={v => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon={<Text style={{ fontSize: 16 }}>✉️</Text>}
            />

            <Input
              label="Password"
              placeholder="Min 8 characters"
              value={form.password}
              onChangeText={v => update('password', v)}
              secureTextEntry
              error={errors.password}
              icon={<Text style={{ fontSize: 16 }}>🔒</Text>}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChangeText={v => update('confirmPassword', v)}
              secureTextEntry
              error={errors.confirmPassword}
              icon={<Text style={{ fontSize: 16 }}>🔒</Text>}
            />

            <Button
              title="Create Account 🩸"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={{ marginTop: 12 }}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { padding: 4 },
  backText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius['2xl'],
    borderWidth: 1, borderColor: Colors.glassBorder, padding: 28
  },
  title: { fontFamily: 'Sora-Bold', fontSize: 24, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  errorBanner: {
    backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: Colors.error + '40'
  },
  errorText: { fontFamily: Typography.body, fontSize: 13, color: Colors.error },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary }
});

export default RegisterScreen;
