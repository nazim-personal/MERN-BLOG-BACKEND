import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { UserRole } from '../src/types/IUser';
import { Post } from '../src/models/Post';

describe('Admin Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    // Create admin user
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      });

    const adminId = adminRes.body.data.user._id;
    await User.findByIdAndUpdate(adminId, { role: UserRole.ADMIN });

    // Login to get token with ADMIN role
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });
    adminToken = adminLoginRes.body.data.tokens.accessToken;

    // Create regular user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
      });

    userToken = userRes.body.data.tokens.accessToken;
    userId = userRes.body.data.user._id;

    // Create a post by regular user
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'User Post',
        content: 'Content by user',
        tags: ['test'],
      });
    postId = postRes.body.data._id;
  });

  describe('GET /api/v1/admin/dashboard', () => {
    it('should get dashboard stats as admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalPosts');
      expect(res.body.data).toHaveProperty('totalComments');
    });

    it('should not allow regular user to access dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PUT /api/v1/admin/users/:id/role', () => {
    it('should update user role as admin', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: UserRole.ADMIN,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe(UserRole.ADMIN);
    });
  });

  describe('DELETE /api/v1/admin/posts/:id', () => {
    it('should hard delete a post as admin', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const post = await Post.findById(postId);
      expect(post).toBeNull();
    });
  });
});
