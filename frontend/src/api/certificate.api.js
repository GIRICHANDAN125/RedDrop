// Certificates API service for RedDrop AI V2
import client from './client';

export const certificateApi = {
  getById: (id) => client.get(`/v2/certificates/${id}`),
  generate: (data) => client.post('/v2/certificates/generate', data),
  verifyQr: (qrCode) => client.post('/v2/certificates/verify', { qrCode })
};

export default certificateApi;
