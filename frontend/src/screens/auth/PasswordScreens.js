import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity, StatusBar, ScrollView
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { authAPI } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.successSection}>
            <View style={styles.successIcon}><Text style={{ fontSize: 48 }}>📬</Text></View>
            <Text style={styles.successTitle}>Check your inbox!</Text>
            <Text style={styles.successText}>
              We've sent a 6-digit OTP to{'\n'}<Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Button
              title="Enter OTP →"
              onPress={() => navigation.navigate('OTPVerification', { email, purpose: 'password_reset' })}
              size="lg"
              style={{ marginTop: 32 }}
            />
            <TouchableOpacity onPress={() => setSent(false)} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={styles.backLink}>← Use a different email</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.iconSection}>
            <View style={styles.iconCircle}><Text style={{ fontSize: 40 }}>🔑</Text></View>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your registered email and we'll send you an OTP to reset your password.</Text>
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View> : null}
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon={<Text style={{ fontSize: 16 }}>✉️</Text>}
            />
            <Button title="Send OTP" onPress={handleSend} loading={loading} size="lg" style={{ marginTop: 8 }} />
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Remember your password? </Text>
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

export const ResetPasswordScreen = ({ navigation, route }) => {
  const { email, otp } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword: password });
      setSuccess(true);
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Reset failed.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.screen }]}>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>🎉</Text>
        <Text style={[styles.title, { textAlign: 'center' }]}>Password Reset!</Text>
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>Your password has been updated. You can now sign in with your new password.</Text>
        <Button title="Go to Login" onPress={() => navigation.navigate('Login')} size="lg" style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}><Text style={{ fontSize: 40 }}>🔒</Text></View>
          </View>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>Set a strong password for your account.</Text>
          {errors.general && <View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {errors.general}</Text></View>}
          <Input label="New Password" placeholder="Min 8 characters" value={password}
            onChangeText={setPassword} secureTextEntry error={errors.password}
            icon={<Text style={{ fontSize: 16 }}>🔒</Text>} />
          <Input label="Confirm New Password" placeholder="Re-enter password" value={confirmPassword}
            onChangeText={setConfirmPassword} secureTextEntry error={errors.confirmPassword}
            icon={<Text style={{ fontSize: 16 }}>🔒</Text>} />
          <Button title="Reset Password" onPress={handleReset} loading={loading} size="lg" style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  content: { flexGrow: 1, paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 40 },
  backBtn: { marginBottom: 40 },
  backText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  iconSection: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: Colors.primaryGlow, borderWidth: 1, borderColor: Colors.primary + '30',
    alignItems: 'center', justifyContent: 'center'
  },
  title: { fontFamily: 'Sora-Bold', fontSize: 26, color: Colors.textPrimary, marginBottom: 12 },
  subtitle: { fontFamily: Typography.body, fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 28 },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.error + '40' },
  errorText: { fontFamily: Typography.body, fontSize: 13, color: Colors.error },
  emailHighlight: { color: Colors.primary, fontFamily: Typography.bodyMedium },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  successSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  successIcon: { marginBottom: 24 },
  successTitle: { fontFamily: 'Sora-Bold', fontSize: 28, color: Colors.textPrimary, marginBottom: 12, textAlign: 'center' },
  successText: { fontFamily: Typography.body, fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  backLink: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary }
});
