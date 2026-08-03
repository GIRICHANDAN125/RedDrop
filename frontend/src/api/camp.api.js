// Camps & Drives API service for RedDrop AI V2
import client from './client';

export const campApi = {
  list: (params) => client.get('/v2/camps', { params }),
  getById: (id) => client.get(`/v2/camps/${id}`),
  create: (data) => client.post('/v2/camps', data)
};

export default campApi;
