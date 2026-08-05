const request = require('supertest');
const { app } = require('../../server');

describe('Performance Test: API Latency', () => {
  test('Health endpoint should respond in under 100ms', async () => {
    const start = Date.now();
    const res = await request(app).get('/health');
    const duration = Date.now() - start;

    expect(res.statusCode).toBe(200);
    expect(duration).toBeLessThan(100);
  });
});
