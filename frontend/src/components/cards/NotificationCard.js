import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';
import { Colors, Typography, Radius, Spacing } from '../../utils/theme';

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

const NotificationCard = React.memo(({
  notification,
  onPress,
  index = 0,
  style
}) => {
  if (!notification) return null;

  const icon = NOTIF_ICONS[notification.type] || '🔔';
  const priorityColor = PRIORITY_COLORS[notification.priority] || Colors.info;
  const isUnread = !notification.isRead;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffMins = Math.floor((new Date() - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card
      onPress={onPress}
      index={index}
      style={[
        styles.card,
        isUnread && styles.unreadCard,
        style
      ]}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconWrap, { backgroundColor: priorityColor + '20', borderColor: priorityColor + '40' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isUnread && styles.unreadTitle]} numberOfLines={1}>
              {notification.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>

          <Text style={styles.timeText}>{formatTime(notification.createdAt)}</Text>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm
  },
  unreadCard: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.bgCardSecondary
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  icon: {
    fontSize: 18
  },
  textCol: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  title: {
    fontFamily: Typography.headingSemibold,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
    flex: 1
  },
  unreadTitle: {
    color: Colors.textPrimary
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 6
  },
  message: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: 4
  },
  timeText: {
    fontFamily: Typography.body,
    fontSize: Typography.sizes.small,
    color: Colors.textMuted
  }
});

export default NotificationCard;
