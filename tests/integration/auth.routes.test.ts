import request from 'supertest';
import express from 'express';
import { AuthModule } from '../../src/index';
import { AuthConfig } from '../../src/config/types';
import mongoose from 'mongoose';

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

// Helper to clear database is handled in setup.ts

describe('Auth Integration Tests', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'integration@example.com',
                    password: 'Password123!',
                    name: 'Integration User'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('integration@example.com');
        });

        it('should fail validation with invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Password123!',
                    name: 'Integration User'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Validation failed');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'Password123!',
                    name: 'Login User'
                });
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'Password123!'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'WrongPassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
