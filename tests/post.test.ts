import request from 'supertest';
import app from '../src/app';
import { Post } from '../src/models/Post';

describe('Post Endpoints', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login to get token
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    token = res.body.data.tokens.accessToken;
    userId = res.body.data.user._id;
  });

  describe('POST /api/v1/posts', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post content.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Post');
      expect(res.body.data.slug).toBe('test-post');
    });

    it('should fail without authorization', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .send({
          title: 'Test Post',
          content: 'This is a test post content.',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/posts', () => {
    it('should get all posts', async () => {
      await Post.create({
        title: 'Post 1',
        content: 'Content 1',
        author: userId,
        slug: 'post-1',
      });

      const res = await request(app).get('/api/v1/posts');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});
