import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { authAPI } from '../../api/client';
import Button from '../../components/common/Button';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const OTPVerificationScreen = ({ navigation, route }) => {
  const { email, purpose } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState('');
  const inputs = useRef([]);
  const shakeAnim = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }]
  }));

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOTPChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();
  };

  const shake = () => {
    shakeAnim.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      shake();
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authAPI.verifyOTP({ email, otp: otpString, purpose });
      if (purpose === 'password_reset') {
        navigation.navigate('ResetPassword', { email, otp: otpString });
      } else {
        navigation.navigate('Main');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      shake();
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.resendOTP({ email, purpose });
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Animated.View entering={FadeInDown.duration(500)} style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📧</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.textSection}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={animatedStyle}>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputs.current[index] = ref}
                  style={[styles.otpInput, digit && styles.otpInputFilled, error && styles.otpInputError]}
                  value={digit}
                  onChangeText={text => handleOTPChange(text.replace(/[^0-9]/g, ''), index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.actions}>
            <Button title="Verify OTP" onPress={handleVerify} loading={loading} size="lg" />

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
                <Text style={[styles.resendLink, resendTimer > 0 && styles.resendLinkDisabled]}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  content: { flex: 1, paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 40 },
  backBtn: { marginBottom: 40 },
  backText: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  iconSection: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1, borderColor: Colors.primary + '30',
    alignItems: 'center', justifyContent: 'center'
  },
  icon: { fontSize: 40 },
  textSection: { marginBottom: 40 },
  title: { fontFamily: 'Sora-Bold', fontSize: 26, color: Colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontFamily: Typography.body, fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  emailHighlight: { color: Colors.primary, fontFamily: Typography.bodyMedium },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  otpInput: {
    width: 52, height: 60, borderRadius: Radius.md,
    backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.glassBorder,
    textAlign: 'center', fontSize: 22, fontFamily: 'Sora-Bold', color: Colors.textPrimary
  },
  otpInputFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  otpInputError: { borderColor: Colors.error },
  errorText: { fontFamily: Typography.body, fontSize: 13, color: Colors.error, textAlign: 'center', marginBottom: 8 },
  actions: { marginTop: 16 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  resendText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textSecondary },
  resendLink: { fontFamily: Typography.bodyMedium, fontSize: 14, color: Colors.primary },
  resendLinkDisabled: { color: Colors.textMuted }
});

export default OTPVerificationScreen;
