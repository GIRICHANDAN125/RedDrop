import { useEffect, useState, useRef } from 'react';
import { connectSocket, onNotification } from '../services/socket.service';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const setupSocket = async () => {
      const socket = await connectSocket();
      if (!socket) return;

      const cleanup = onNotification((notification) => {
        setUnreadCount(prev => prev + 1);
        setLatestNotification(notification);
      });

      cleanupRef.current = cleanup;
    };

    setupSocket();

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [isAuthenticated]);

  const resetCount = () => setUnreadCount(0);
  const clearLatest = () => setLatestNotification(null);

  return { unreadCount, latestNotification, resetCount, clearLatest };
};
