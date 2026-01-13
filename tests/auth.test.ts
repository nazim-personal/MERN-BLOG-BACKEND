import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';

describe('Auth Endpoints', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('_id');
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data).toHaveProperty('tokens');
    });

    it('should not register a user with existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: userData.email,
        password: 'password123',
        role: 'user',
        provider: 'local',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(userData);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: userData.email,
        password: userData.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tokens');
    });

    it('should not login with invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: userData.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });
  });
});
