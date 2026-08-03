import { useEffect } from 'react';
import socketService from '../services/socket.service';

/**
 * useSocket — Subscribe to raw Socket.IO events in a component lifecycle-safe way.
 * Automatically unregisters the handler on component unmount.
 *
 * @param {string} event - Socket.IO event name to listen to
 * @param {Function} handler - Callback invoked when the event fires
 */
export const useSocket = (event, handler) => {
  useEffect(() => {
    socketService.on(event, handler);
    return () => {
      socketService.off(event, handler);
    };
  }, [event, handler]);
};

export default useSocket;
