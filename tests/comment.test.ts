import request from 'supertest';
import app from '../src/app';
import { Comment } from '../src/models/Comment';

describe('Comment Endpoints', () => {
  let token: string;
  let userId: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    // Create user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Commenter',
        email: 'commenter@example.com',
        password: 'password123',
      });

    expect(userRes.status).toBe(201);
    token = userRes.body.data.tokens.accessToken;
    userId = userRes.body.data.user._id;

    // Create post
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Post for Comments',
        content: 'This post will have comments.',
        tags: ['test'],
      });

    expect(postRes.status).toBe(201);
    postId = postRes.body.data._id;

    // Create a default comment
    const commentRes = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Default test comment',
      });
    commentId = commentRes.body.data._id;
  });

  describe('POST /api/v1/posts/:postId/comments', () => {
    it('should create a new comment', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is a test comment',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('This is a test comment');
      expect(res.body.data.post).toBe(postId);
      expect(res.body.data.author._id).toBe(userId);
      commentId = res.body.data._id;
    });

    it('should not create a comment with empty content', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/posts/:postId/comments', () => {
    it('should get all comments for a post', async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${postId}/comments`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/v1/comments/:id', () => {
    it('should update a comment', async () => {
      const res = await request(app)
        .put(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Updated comment content',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Updated comment content');
    });

    it('should not update a comment by another user', async () => {
      // Create another user
      const otherUserRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserRes.body.data.tokens.accessToken;

      const res = await request(app)
        .put(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: 'Hacked content',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/comments/:id', () => {
    it('should delete a comment', async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedComment = await Comment.findById(commentId);
      expect(deletedComment).toBeNull();
    });
  });
});
