// Blood Requests API service for RedDrop AI V2
import client from './client';

export const requestApi = {
  create: (data) => client.post('/v2/requests', data),
  getById: (id) => client.get(`/v2/requests/${id}`),
  updateStatus: (id, status) => client.patch(`/v2/requests/${id}/status`, { status }),
  list: (params) => client.get('/v2/requests', { params })
};

export default requestApi;
