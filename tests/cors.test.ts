import request from 'supertest';
import app from '../src/app';

describe('CORS Configuration', () => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  allowedOrigins.forEach((origin) => {
    it(`should allow requests from ${origin}`, async () => {
      const res = await request(app)
        .options('/api/v1/auth/register')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST');

      expect(res.headers['access-control-allow-origin']).toBe(origin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  it('should not allow requests from unauthorized origins in non-development', async () => {
    // Force NODE_ENV to production for this test
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const unauthorizedOrigin = 'http://malicious-site.com';
    const res = await request(app)
      .options('/api/v1/auth/register')
      .set('Origin', unauthorizedOrigin)
      .set('Access-Control-Request-Method', 'POST');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});
