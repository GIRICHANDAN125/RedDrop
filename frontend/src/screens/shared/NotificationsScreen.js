import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar
} from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { notificationAPI } from '../../api/client';
import Card from '../../components/common/Card';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

const NOTIF_ICONS = {
  blood_request_nearby: '🩸',
  request_accepted: '🤝',
  donor_found: '🎉',
  blood_in_transit: '🚗',
  blood_delivered: '✅',
  request_expired: '⏰',
  new_badge: '🏅',
  verification_approved: '✓',
  emergency_alert: '🚨',
  system: '⚙️'
};

const PRIORITY_COLORS = {
  critical: Colors.critical,
  high: Colors.high,
  normal: Colors.info,
  low: Colors.textMuted
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ page: 1, limit: 50 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead([id]);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleNotifPress = (notif) => {
    if (!notif.isRead) handleMarkRead(notif._id);
    if (notif.data?.requestId) {
      navigation.navigate('RequestDetail', { id: notif.data.requestId });
    }
  };

  const renderNotification = ({ item, index }) => {
    const icon = NOTIF_ICONS[item.type] || '🔔';
    const priorityColor = PRIORITY_COLORS[item.priority] || Colors.info;
    return (
      <Animated.View entering={SlideInRight.delay(index * 50).duration(300)}>
        <TouchableOpacity
          style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
          onPress={() => handleNotifPress(item)}
          activeOpacity={0.75}
        >
          <View style={[styles.notifIconWrap, { backgroundColor: priorityColor + '20' }]}>
            <Text style={styles.notifIcon}>{icon}</Text>
          </View>
          <View style={styles.notifContent}>
            <View style={styles.notifTitleRow}>
              <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
            <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔕</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>You'll be notified about blood requests, donor responses, and status updates.</Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingTop: 52, paddingBottom: 16 },
  backText: { fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.textPrimary, paddingHorizontal: 4 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: 'Sora-Bold', fontSize: 19, color: Colors.textPrimary },
  badge: { backgroundColor: Colors.primary, borderRadius: Radius.full, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontFamily: 'Sora-Bold', fontSize: 10, color: '#fff' },
  markAllText: { fontFamily: Typography.bodyMedium, fontSize: 12, color: Colors.primary },
  listContent: { paddingHorizontal: Spacing.screen, paddingBottom: 80 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, gap: 12 },
  notifItemUnread: { backgroundColor: Colors.primaryGlow + '30', borderRadius: Radius.lg, paddingHorizontal: 8, marginHorizontal: -8 },
  notifIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notifIcon: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  notifTitle: { fontFamily: 'Sora-SemiBold', fontSize: 14, color: Colors.textPrimary, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8 },
  notifBody: { fontFamily: Typography.body, fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 5 },
  notifTime: { fontFamily: Typography.body, fontSize: 11, color: Colors.textMuted },
  separator: { height: 1, backgroundColor: Colors.divider },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Sora-SemiBold', fontSize: 18, color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontFamily: Typography.body, fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 }
});

export default NotificationsScreen;
