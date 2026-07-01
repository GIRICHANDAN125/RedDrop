import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolate
} from 'react-native-reanimated';
import { Colors, Radius } from '../../utils/theme';

const Skeleton = ({ width, height, borderRadius = Radius.md, style }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7])
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animStyle,
        style
      ]}
    />
  );
};

export const DonorCardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.col}>
        <Skeleton width={140} height={14} style={{ marginBottom: 8 }} />
        <Skeleton width={100} height={11} style={{ marginBottom: 6 }} />
        <Skeleton width={80} height={11} />
      </View>
      <Skeleton width={48} height={48} borderRadius={12} />
    </View>
    <Skeleton width="100%" height={36} borderRadius={Radius.md} style={{ marginTop: 12 }} />
  </View>
);

export const RequestCardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Skeleton width={70} height={22} borderRadius={Radius.full} />
      <Skeleton width={48} height={48} borderRadius={12} />
    </View>
    <Skeleton width={160} height={18} style={{ marginTop: 12, marginBottom: 6 }} />
    <Skeleton width={220} height={13} style={{ marginBottom: 12 }} />
    <View style={[styles.row, { justifyContent: 'space-between' }]}>
      <Skeleton width={100} height={12} />
      <Skeleton width={60} height={12} />
    </View>
  </View>
);

export const ProfileSkeleton = () => (
  <View style={styles.profileSkeleton}>
    <View style={[styles.row, { marginBottom: 20 }]}>
      <Skeleton width={64} height={64} borderRadius={32} />
      <View style={styles.col}>
        <Skeleton width={150} height={18} style={{ marginBottom: 8 }} />
        <Skeleton width={120} height={13} style={{ marginBottom: 6 }} />
        <Skeleton width={80} height={13} />
      </View>
    </View>
    {[1, 2, 3].map(i => (
      <Skeleton key={i} width="100%" height={48} borderRadius={Radius.lg} style={{ marginBottom: 12 }} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: { backgroundColor: Colors.bgCardSecondary },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1,
    borderColor: Colors.glassBorder, padding: 16, marginBottom: 12
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  col: { flex: 1 },
  profileSkeleton: { padding: 16 }
});

export default Skeleton;
