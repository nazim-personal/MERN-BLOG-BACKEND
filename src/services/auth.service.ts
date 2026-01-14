import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthConfig } from '../config/types';
import { UserRepository } from '../repositories/user.repository';
import { SessionService } from './session.service';
import { logger } from '../utils/logger';
import { Role, RolePermissions } from '../config/roles';

export class AuthService {
    private config: AuthConfig;
    private userRepository: UserRepository;
    private sessionService: SessionService;

    constructor(
        config: AuthConfig,
        userRepository: UserRepository,
        sessionService: SessionService
    ) {
        this.config = config;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
    }

    async register(payload: {
        email: string;
        password: string;
        name?: string;
        device: { ip: string; userAgent: string };
    }) {
        const existing = await this.userRepository.findByEmail(payload.email);
        if (existing) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(payload.password, 12);

        const defaultPermissions = RolePermissions[Role.USER] || [];

        const user = await this.userRepository.create({
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            permissions: defaultPermissions
        });

        const userRole = (user.role as Role) || Role.USER;
        const effectivePermissions = Array.from(new Set([
            ...defaultPermissions,
            ...(user.permissions || [])
        ]));

        return {
            message: 'User registered successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: userRole,
                permissions: effectivePermissions,
                createdAt: (user as any).createdAt
            }
        };
    }

    async login(payload: {
        email: string;
        password: string;
        device: { ip: string; userAgent: string };
    }) {
        const user = await this.userRepository.findByEmail(payload.email);
        if (!user) {
            logger.warn(`Failed login attempt: User not found for email ${payload.email}`);
            throw new Error('Invalid credentials');
        }

        if (!user.password) {
            logger.warn(`Failed login attempt: User ${payload.email} has no password set`);
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(payload.password, user.password);
        if (!isValid) {
            logger.warn(`Failed login attempt: Incorrect password for user ${payload.email}`);
            throw new Error('Invalid credentials');
        }

        return this.generateTokens(user, payload.device);
    }

    async loginWithSocialProvider(user: any, device: { ip: string; userAgent: string }) {
        return this.generateTokens(user, device);
    }

    private async generateTokens(user: any, device: { ip: string; userAgent: string }) {
        const userId = user._id;
        const { session, refreshToken } = await this.sessionService.createSession(
            userId as Types.ObjectId,
            device
        );

        const accessToken = jwt.sign(
            { userId: userId, sessionId: session._id },
            this.config.jwt.accessSecret,
            { expiresIn: this.config.jwt.accessTTL as any }
        );

        return {
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: userId,
                    email: user.email,
                    name: user.name,
                    role: user.role || Role.USER,
                    permissions: Array.from(new Set([
                        ...(RolePermissions[(user.role as Role) || Role.USER] || []),
                        ...(user.permissions || [])
                    ]))
                }
            }
        };
    }

    async logout(payload: { sessionId: string }) {
        await this.sessionService.deactivateSession(payload.sessionId);
        return {
            message: 'Logged out successfully'
        };
    }

    async refreshAccessToken(payload: { refreshToken: string }) {
        const session = await this.sessionService.validateRefreshToken(payload.refreshToken);

        if (!session) {
            throw new Error('Invalid or expired refresh token');
        }

        const user = await this.userRepository.findById(session.userId as any);
        if (!user) {
            throw new Error('User not found');
        }

        const accessToken = jwt.sign(
            { userId: user._id, sessionId: session._id },
            this.config.jwt.accessSecret,
            { expiresIn: this.config.jwt.accessTTL as any }
        );

        return {
            message: 'Access token refreshed successfully',
            data: {
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role || Role.USER,
                    permissions: Array.from(new Set([
                        ...(RolePermissions[(user.role as Role) || Role.USER] || []),
                        ...(user.permissions || [])
                    ]))
                }
            }
        };
    }


    async updateUserRole(payload: {
        userId: string;
        newRole: Role;
        updatedBy: string;
    }) {
        const updater = await this.userRepository.findById(payload.updatedBy as any);
        if (!updater || updater.role !== Role.ADMIN) {
            throw new Error('Only ADMIN can update user roles');
        }

        if (!Object.values(Role).includes(payload.newRole)) {
            throw new Error('Invalid role');
        }

        const user = await this.userRepository.updateRole(payload.userId, payload.newRole);
        if (!user) {
            throw new Error('User not found');
        }

        logger.info(`User ${payload.userId} role updated to ${payload.newRole} by ${payload.updatedBy}`);

        return {
            message: 'User role updated successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: RolePermissions[user.role as Role] || []
            }
        };
    }

    async updateUserPermissions(payload: {
        userId: string;
        action: 'add' | 'remove';
        permissions: string[];
        updatedBy: string;
    }) {
        const updater = await this.userRepository.findById(payload.updatedBy as any);
        if (!updater || updater.role !== Role.ADMIN) {
            throw new Error('Only ADMIN can update user permissions');
        }

        const user = await this.userRepository.findById(payload.userId as any);
        if (!user) {
            throw new Error('User not found');
        }

        let updatedPermissions = user.permissions || [];

        if (payload.action === 'add') {
            updatedPermissions = Array.from(new Set([...updatedPermissions, ...payload.permissions]));
        } else {
            updatedPermissions = updatedPermissions.filter(p => !payload.permissions.includes(p));
        }

        const updatedUser = await this.userRepository.updatePermissions(payload.userId, updatedPermissions);

        if (!updatedUser) {
            throw new Error('Failed to update user permissions');
        }

        logger.info(`User ${payload.userId} permissions ${payload.action}ed by ${payload.updatedBy}`);

        return {
            message: 'User permissions updated successfully',
            data: {
                id: updatedUser._id,
                email: updatedUser.email,
                customPermissions: updatedUser.permissions,
                rolePermissions: RolePermissions[updatedUser.role as Role] || [],
                effectivePermissions: Array.from(new Set([
                    ...(RolePermissions[updatedUser.role as Role] || []),
                    ...(updatedUser.permissions || [])
                ]))
            }
        };
    }

    async listUsers(payload: {
        page?: number;
        limit?: number;
        role?: Role;
    }) {
        const users = await this.userRepository.findAll({
            page: payload.page || 1,
            limit: payload.limit || 10,
            role: payload.role
        });

        return {
            message: 'Users retrieved successfully',
            data: users.map(user => ({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role || Role.USER,
                permissions: RolePermissions[user.role as Role] || RolePermissions[Role.USER],
                customPermissions: user.permissions || [],
                createdAt: (user as any).createdAt
            }))
        };
    }

    async getUserProfile(userId: string) {
        const user = await this.userRepository.findById(userId as any);
        if (!user) {
            throw new Error('User not found');
        }

        return {
            message: 'User profile retrieved successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role || Role.USER,
                permissions: Array.from(new Set([
                    ...(RolePermissions[(user.role as Role) || Role.USER] || []),
                    ...(user.permissions || [])
                ]))
            }
        };
    }
}
