// Notification API service for RedDrop AI V2
import client from './client';

export const notificationApi = {
  list: (params) => client.get('/v2/notifications', { params }),
  markRead: (id) => client.patch(`/v2/notifications/${id}/read`)
};

export default notificationApi;
