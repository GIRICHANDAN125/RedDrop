// Donor Management API service for RedDrop AI V2
import client from './client';

export const donorApi = {
  getNearby: (params) => client.get('/v2/donors/nearby', { params }),
  getMyProfile: () => client.get('/v2/donors/me'),
  updateProfile: (data) => client.patch('/v2/donors/me', data)
};

export default donorApi;
