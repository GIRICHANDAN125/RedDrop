import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const hapticImpact = (style = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(style).catch(() => {});
    } catch {
      // Ignore web or unsupported device error
    }
  }
};

export const hapticNotification = (type = Haptics.NotificationFeedbackType.Success) => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.notificationAsync(type).catch(() => {});
    } catch {
      // Ignore
    }
  }
};

export const hapticSelection = () => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {
      // Ignore
    }
  }
};

export default {
  impact: hapticImpact,
  notification: hapticNotification,
  selection: hapticSelection
};
