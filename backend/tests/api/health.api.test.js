const request = require('supertest');
const { app } = require('../../server');

describe('API Test: Health Endpoint', () => {
  test('GET /health should return 200 OK with status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('service', 'Red Drop AI Backend');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /api/nonexistent-route should return 404 NOT_FOUND RFC 7807 payload', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.type).toBe('NOT_FOUND');
  });
});
