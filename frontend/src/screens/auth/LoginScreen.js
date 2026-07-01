import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Image, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, SlideInLeft
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setErrors({ general: result.error });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />

      {/* Background gradient mesh */}
      <View style={styles.bgMesh}>
        <View style={styles.meshCircle1} />
        <View style={styles.meshCircle2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoSection}>
            <View style={styles.logoMark}>
              <Text style={styles.logoIcon}>🩸</Text>
            </View>
            <Text style={styles.appName}>Red Drop AI</Text>
            <Text style={styles.appTagline}>Emergency Blood Network</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {errors.general && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {errors.general}</Text>
              </View>
            )}

            <Input
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
              icon={<Text style={styles.inputIcon}>✉️</Text>}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              icon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.loginBtn}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Stats row */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.statsRow}>
            {[
              { value: '2M+', label: 'Donors' },
              { value: '50K+', label: 'Lives Saved' },
              { value: '500+', label: 'Hospitals' }
            ].map((stat, i) => (
              <View key={i} style={styles.stat}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  bgMesh: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  meshCircle1: {
    position: 'absolute', top: -100, right: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.primary, opacity: 0.06
  },
  meshCircle2: {
    position: 'absolute', bottom: 100, left: -120,
    width: 350, height: 350, borderRadius: 175,
    backgroundColor: '#4361EE', opacity: 0.04
  },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.screen, paddingTop: 60, paddingBottom: 40 },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoMark: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1, borderColor: Colors.primary + '40',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16
  },
  logoIcon: { fontSize: 36 },
  appName: { fontFamily: 'Sora-Bold', fontSize: 28, color: Colors.textPrimary, letterSpacing: -0.5 },
  appTagline: { fontFamily: Typography.body, fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  // Card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 28,
    marginBottom: 28
  },
  cardTitle: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary, marginBottom: 28 },

  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error + '40'
  },
  errorBannerText: { fontFamily: Typography.body, fontSize: 13, color: Colors.error },

  inputIcon: { fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
  forgotText: { fontFamily: Typography.bodyMedium, fontSize: 13, color: Colors.primary },

  loginBtn: { marginTop: 4 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { fontFamily: Typography.body, fontSize: 13, color: Colors.textMuted, marginHorizontal: 12 },

  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary },
  registerLink: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 20
  },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: 'Sora-Bold', fontSize: 20, color: Colors.primary },
  statLabel: { fontFamily: Typography.body, fontSize: 12, color: Colors.textMuted, marginTop: 2 }
});

export default LoginScreen;
