import request from 'supertest';
import express from 'express';
import { AuthModule } from '../../src/index';
import { AuthConfig } from '../../src/config/types';
import { UserModel } from '../../src/models/user.model';
import { Role } from '../../src/config/roles';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

const testConfig: AuthConfig = {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/test',
    jwt: {
        accessSecret: 'test-access-secret',
        accessTTL: '15m',
        refreshSecret: 'test-refresh-secret',
        refreshTTLms: 1000 * 60 * 60 * 24 // 1 day
    },
    sessionSecret: 'test-session-secret'
};

const authModule = AuthModule.init(testConfig);
app.use('/api', authModule.router);

describe('Admin Integration Tests', () => {
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
        // Create an admin user
        const adminPassword = await bcrypt.hash('AdminPass123!', 12);
        const admin = await UserModel.create({
            email: 'admin@example.com',
            password: adminPassword,
            name: 'Admin User',
            role: Role.ADMIN
        });

        // Create a regular user
        const userPassword = await bcrypt.hash('UserPass123!', 12);
        const user = await UserModel.create({
            email: 'user@example.com',
            password: userPassword,
            name: 'Regular User',
            role: Role.USER
        });

        // Login as admin
        const adminLoginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'AdminPass123!'
            });
        adminToken = adminLoginRes.body.data.accessToken;

        // Login as user
        const userLoginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'user@example.com',
                password: 'UserPass123!'
            });
        userToken = userLoginRes.body.data.accessToken;
    });

    describe('GET /api/v1/admin/dashboard', () => {
        it('should return dashboard stats for admin', async () => {
            const res = await request(app)
                .get('/api/v1/admin/dashboard')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('users');
            expect(res.body.data).toHaveProperty('posts');
            expect(res.body.data).toHaveProperty('comments');
            expect(res.body.data.users.total).toBe(2);
            expect(res.body.data.users.admins).toBe(1);
        });

        it('should fail for regular user', async () => {
            const res = await request(app)
                .get('/api/v1/admin/dashboard')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should fail for unauthenticated user', async () => {
            const res = await request(app)
                .get('/api/v1/admin/dashboard');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/posts', () => {
        it('should allow admin to create a post', async () => {
            const res = await request(app)
                .post('/api/v1/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Admin Post',
                    content: 'Content from admin',
                    status: 'published',
                    tags: ['admin', 'test']
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Admin Post');
        });

        it('should allow regular user to create a post', async () => {
            const res = await request(app)
                .post('/api/v1/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'User Post',
                    content: 'Content from user',
                    status: 'published',
                    tags: ['user', 'test']
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('User Post');
        });
    });
});
