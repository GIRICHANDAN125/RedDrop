import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors, Typography, Radius, Spacing, Overlay } from '../../utils/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet = React.memo(({
  visible = false,
  onClose,
  title,
  children,
  snapHeight = SCREEN_HEIGHT * 0.5
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 120 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { maxHeight: snapHeight }, animatedSheetStyle]}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Overlay.backdropColor
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingBottom: Spacing.xl,
    overflow: 'hidden'
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm
  },
  dragHandle: {
    width: Overlay.dragHandle.width,
    height: Overlay.dragHandle.height,
    borderRadius: Overlay.dragHandle.borderRadius,
    backgroundColor: Overlay.dragHandle.color
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider
  },
  title: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.h4,
    color: Colors.textPrimary
  },
  content: {
    padding: Spacing.lg
  }
});

export default BottomSheet;
