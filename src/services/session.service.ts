import crypto from 'crypto';
import { Types } from 'mongoose';
import { SessionRepository } from '../repositories/session.repository';
import { AuthConfig } from '../config/types';

export class SessionService {
    private sessionRepository: SessionRepository;
    private config: AuthConfig;

    constructor(sessionRepository: SessionRepository, config: AuthConfig) {
        this.sessionRepository = sessionRepository;
        this.config = config;
    }

    async createSession(userId: Types.ObjectId, device: { ip: string; userAgent: string }) {
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await this.sessionRepository.create({
            user_id: userId,
            refresh_token_hash: refreshTokenHash,
            device: {
                ip: device.ip,
                user_agent: device.userAgent
            },
            expires_at: new Date(Date.now() + this.config.jwt.refreshTTLms),
            is_active: true
        });

        return { session, refreshToken };
    }

    async deactivateSession(sessionId: string) {
        await this.sessionRepository.deactivateById(sessionId);
    }

    async validateSession(sessionId: string) {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session || !session.is_active) {
            return null;
        }
        return session;
    }

    async validateRefreshToken(refreshToken: string) {
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);

        if (!session || !session.is_active) {
            return null;
        }

        if (session.expires_at < new Date()) {
            await this.sessionRepository.deactivateById(session.id.toString());
            return null;
        }

        return session;
    }
}
