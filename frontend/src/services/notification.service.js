/**
 * Notification Service — push notification setup for RedDrop AI V2
 * Handles expo-notifications token registration and local/remote handlers.
 */
// TODO: integrate expo-notifications
// import * as Notifications from 'expo-notifications';

const notificationService = {
  /**
   * Register device for push notifications and return Expo push token.
   * @returns {Promise<string>} Expo push token
   */
  registerForPushNotifications: async () => {
    // const { status } = await Notifications.requestPermissionsAsync();
    // if (status !== 'granted') throw new Error('Notification permission denied.');
    // const token = await Notifications.getExpoPushTokenAsync();
    // return token.data;
    return null; // TODO: remove stub when expo-notifications is wired
  },

  /**
   * Schedule a local notification.
   */
  scheduleLocal: async (title, body, data = {}) => {
    // await Notifications.scheduleNotificationAsync({
    //   content: { title, body, data },
    //   trigger: null // immediate
    // });
  }
};

export default notificationService;
