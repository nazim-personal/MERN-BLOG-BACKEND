import request from 'supertest';
import express from 'express';
import passport from 'passport';
import { AuthModule } from '../src/index';
import { UserModel } from '../src/models/user.model';
import mongoose from 'mongoose';
import { Role } from '../src/config/roles';

const mockUserId = new mongoose.Types.ObjectId();

// Mock passport
jest.mock('passport', () => {
    const originalPassport = jest.requireActual('passport');
    return {
        ...originalPassport,
        authenticate: jest.fn((strategy, options) => {
            return (req: express.Request, res: express.Response, next: express.NextFunction) => {
                if (strategy === 'google' || strategy === 'facebook') {
                    // Simulate successful authentication
                    if (req.path.includes('callback')) {
                        req.user = {
                            id: mockUserId.toString(),
                            email: 'test@example.com',
                            name: 'Test User',
                            role: 'USER',
                            permissions: []
                        };
                        return next();
                    }
                    // Simulate redirect for init
                    return res.redirect('/mock-provider-auth');
                }
                return next();
            };
        }),
        initialize: () => (req: express.Request, res: express.Response, next: express.NextFunction) => next(),
    };
});

describe('Social Auth Routes', () => {
    let app: express.Application;

    beforeAll(async () => {
        // Mongoose is already connected by tests/setup.ts

        const authConfig = {
            mongoUri: 'mongodb://localhost:27017/test', // Dummy URI
            jwt: {
                accessSecret: 'test-secret',
                accessTTL: '15m',
                refreshSecret: 'test-refresh-secret',
                refreshTTLms: 3600000
            },
            sessionSecret: 'test-session-secret'
        };

        app = express();
        app.use(express.json());
        // We don't need real passport init here since we mocked it

        const authModule = AuthModule.init(authConfig);
        app.use('/api', authModule.router);
    });

    // afterAll handled by tests/setup.ts

    beforeEach(async () => {
        // Database cleanup handled by tests/setup.ts afterEach?
        // setup.ts cleans up afterEach.
        // But we need to create a user for the test.

        await UserModel.create({
            _id: mockUserId,
            email: 'test@example.com',
            name: 'Test User',
            role: Role.USER,
            permissions: []
        });
    });

    it('should redirect to google auth', async () => {
        const res = await request(app).get('/api/v1/auth/google');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/mock-provider-auth');
    });

    it('should handle google callback and redirect with tokens', async () => {
        const res = await request(app).get('/api/v1/auth/google/callback');
        expect(res.status).toBe(302);
        expect(res.header.location).toContain('/dashboard');
        expect(res.header.location).toContain('token=');
        expect(res.header.location).toContain('refreshToken=');
    });

    it('should redirect to facebook auth', async () => {
        const res = await request(app).get('/api/v1/auth/facebook');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/mock-provider-auth');
    });

    it('should handle facebook callback and redirect with tokens', async () => {
        const res = await request(app).get('/api/v1/auth/facebook/callback');
        expect(res.status).toBe(302);
        expect(res.header.location).toContain('/dashboard');
        expect(res.header.location).toContain('token=');
        expect(res.header.location).toContain('refreshToken=');
    });
});
