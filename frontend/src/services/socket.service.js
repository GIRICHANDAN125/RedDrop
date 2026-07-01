import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = async () => {
  if (socket?.connected) return socket;

  const token = await SecureStore.getItemAsync('auth_token');
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  });

  socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));
  socket.on('disconnect', (reason) => console.warn('Socket disconnected:', reason));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinRequestRoom = (requestId) => {
  socket?.emit('join:request', requestId);
};

export const leaveRequestRoom = (requestId) => {
  socket?.emit('leave:request', requestId);
};

export const joinLocationRoom = (city, state) => {
  socket?.emit('join:location', { city, state });
};

export const onNotification = (callback) => {
  socket?.on('notification:new', callback);
  return () => socket?.off('notification:new', callback);
};

export const onRequestUpdate = (callback) => {
  socket?.on('request:updated', callback);
  socket?.on('request:status', callback);
  return () => {
    socket?.off('request:updated', callback);
    socket?.off('request:status', callback);
  };
};

export const onDonorAccepted = (callback) => {
  socket?.on('donor:accepted', callback);
  return () => socket?.off('donor:accepted', callback);
};

export const onDonorLocation = (callback) => {
  socket?.on('donor:location', callback);
  return () => socket?.off('donor:location', callback);
};
