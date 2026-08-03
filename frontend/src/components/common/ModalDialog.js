import React from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, { ZoomIn, ZoomOut, FadeIn } from 'react-native-reanimated';
import Button from './Button';
import { Colors, Typography, Radius, Spacing, Overlay } from '../../utils/theme';

const ModalDialog = React.memo(({
  visible = false,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info', // 'info' | 'danger' | 'success'
  loading = false
}) => {
  if (!visible) return null;

  const typeIcons = {
    info: 'ℹ️',
    danger: '⚠️',
    success: '✅'
  };

  const buttonVariants = {
    info: 'primary',
    danger: 'danger',
    success: 'success'
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          entering={ZoomIn.duration(250)}
          exiting={ZoomOut.duration(200)}
          style={styles.dialog}
        >
          <Text style={styles.icon}>{typeIcons[type] || 'ℹ️'}</Text>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {onCancel && (
              <Button
                title={cancelText}
                onPress={onCancel}
                variant="ghost"
                fullWidth={false}
                style={styles.btn}
              />
            )}
            {onConfirm && (
              <Button
                title={confirmText}
                onPress={onConfirm}
                variant={buttonVariants[type] || 'primary'}
                loading={loading}
                fullWidth={false}
                style={styles.btn}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Overlay.backdropColor
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.xl,
    alignItems: 'center'
  },
  icon: {
    fontSize: 36,
    marginBottom: Spacing.sm
  },
  title: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs
  },
  message: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    width: '100%'
  },
  btn: {
    flex: 1
  }
});

export default ModalDialog;
