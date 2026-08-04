import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '🩸',
    title: 'AI-Powered Blood Matching',
    description: 'Find compatible blood donors near you in seconds using high-precision geospatial algorithms and real-time urgency scoring.'
  },
  {
    id: '2',
    icon: '🚨',
    title: 'Emergency Dispatch',
    description: 'Instantly broadcast emergency blood requests to verified donors and nearby hospitals with live 6-step dispatch tracking.'
  },
  {
    id: '3',
    icon: '🎖️',
    title: 'Verified Impact',
    description: 'Earn digital blockchain-verified certificates, join leaderboards, and save lives in your local community.'
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View key={currentSlide.id} entering={FadeIn.duration(400)} style={styles.slideContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{currentSlide.icon}</Text>
          </View>
          <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.title}>
            {currentSlide.title}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={styles.description}>
            {currentSlide.description}
          </Animated.Text>
        </Animated.View>

        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === activeIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, alignItems: 'flex-end' },
  skipText: { color: Colors.textMuted, fontSize: 14, fontFamily: Typography.bodyMedium },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl },
  slideContainer: { alignItems: 'center' },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.glassBorder
  },
  iconText: { fontSize: 56 },
  title: { fontSize: 26, fontFamily: Typography.heading, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.md },
  description: { fontSize: 15, fontFamily: Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  indicatorContainer: { flexDirection: 'row', marginTop: Spacing.xxl },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.glassBorder, marginHorizontal: 4 },
  activeIndicator: { width: 24, backgroundColor: Colors.primary },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl }
});

export default OnboardingScreen;
