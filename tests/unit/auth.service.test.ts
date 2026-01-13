import { jest } from '@jest/globals';
import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { SessionService } from '../../src/services/session.service';
import { AuthConfig } from '../../src/config/types';
import { Role } from '../../src/config/roles';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/services/session.service');

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: any;
    let sessionService: any;

    const mockConfig: AuthConfig = {
        mongoUri: 'mongodb://localhost:27017/test',
        jwt: {
            accessSecret: 'access-secret',
            accessTTL: '15m',
            refreshSecret: 'refresh-secret',
            refreshTTLms: 1000 * 60 * 60 * 24 * 7 // 7 days
        },
        sessionSecret: 'session-secret'
    };

    beforeEach(() => {
        userRepository = new UserRepository() as any;
        userRepository.findByEmail = jest.fn() as any;
        userRepository.create = jest.fn() as any;
        userRepository.findById = jest.fn() as any;
        userRepository.update = jest.fn() as any;
        userRepository.delete = jest.fn() as any;

        sessionService = new SessionService({} as any, mockConfig) as any;
        sessionService.createSession = jest.fn() as any;
        sessionService.revokeSession = jest.fn() as any;
        sessionService.validateSession = jest.fn() as any;

        authService = new AuthService(mockConfig, userRepository as any, sessionService as any);

        jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword') as any);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true) as any);
        jest.spyOn(jwt, 'sign').mockImplementation(() => 'accessToken' as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const payload = {
                email: 'test@example.com',
                password: 'Password123!',
                name: 'Test User',
                device: { ip: '127.0.0.1', userAgent: 'TestAgent' }
            };

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockResolvedValue({
                id: 'userId',
                email: payload.email,
                name: payload.name,
                role: Role.USER,
                permissions: [],
                created_at: new Date()
            } as any);

            const result = await authService.register(payload);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(payload.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 12);
            expect(userRepository.create).toHaveBeenCalled();
            expect(result.message).toBe('User registered successfully');
            expect(result.data.email).toBe(payload.email);
        });

        it('should throw error if user already exists', async () => {
            const payload = {
                email: 'existing@example.com',
                password: 'Password123!',
                name: 'Existing User',
                device: { ip: '127.0.0.1', userAgent: 'TestAgent' }
            };

            userRepository.findByEmail.mockResolvedValue({ id: 'existingId' } as any);

            await expect(authService.register(payload)).rejects.toThrow('User already exists');
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const payload = {
                email: 'test@example.com',
                password: 'Password123!',
                device: { ip: '127.0.0.1', userAgent: 'TestAgent' }
            };

            const mockUser = {
                id: 'userId',
                email: payload.email,
                password: 'hashedPassword',
                role: Role.USER,
                permissions: []
            };

            userRepository.findByEmail.mockResolvedValue(mockUser as any);
            sessionService.createSession.mockResolvedValue({
                session: { id: 'sessionId' },
                refreshToken: 'refreshToken'
            } as any);

            const result = await authService.login(payload);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(payload.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(payload.password, mockUser.password);
            expect(sessionService.createSession).toHaveBeenCalled();
            expect(result.message).toBe('Login successful');
            expect(result.data.accessToken).toBe('accessToken');
        });

        it('should throw error for invalid credentials', async () => {
            const payload = {
                email: 'test@example.com',
                password: 'WrongPassword',
                device: { ip: '127.0.0.1', userAgent: 'TestAgent' }
            };

            userRepository.findByEmail.mockResolvedValue(null);

            await expect(authService.login(payload)).rejects.toThrow('Invalid credentials');
        });
    });
});
