import { SessionModel, Session } from '../models/session.model';
import { Document, Types } from 'mongoose';
import { isValidObjectId, toObjectId } from '../utils/sanitization.util';

export class SessionRepository {
    async create(data: Partial<Session>): Promise<Session & Document> {
        return await SessionModel.create(data);
    }

    async findByRefreshTokenHash(hash: string): Promise<any> {
        return await SessionModel.findOne({ refreshTokenHash: hash, isActive: true }).lean();
    }

    async findAndLock(hash: string): Promise<(Session & Document) | null> {
        return await SessionModel.findOneAndUpdate(
            { refreshTokenHash: hash, isActive: true, concurrencyLock: null },
            { concurrencyLock: new Date().toISOString() },
            { new: true }
        );
    }

    async updateWithRotation(sessionId: any, data: Partial<Session>): Promise<void> {
        if (!isValidObjectId(sessionId)) {
            throw new Error('Invalid session ID');
        }
        await SessionModel.findByIdAndUpdate(toObjectId(sessionId), {
            ...data,
            concurrencyLock: null
        });
    }

    async deactivateAllForUser(userId: string): Promise<void> {
        if (!isValidObjectId(userId)) {
            return;
        }
        await SessionModel.updateMany({ userId: toObjectId(userId), isActive: true }, { isActive: false });
    }

    async deactivateByHash(hash: string): Promise<void> {
        await SessionModel.updateOne({ refreshTokenHash: hash, isActive: true }, { isActive: false });
    }

    async deactivateById(sessionId: string): Promise<void> {
        if (!isValidObjectId(sessionId)) {
            return;
        }
        await SessionModel.findByIdAndUpdate(toObjectId(sessionId), { isActive: false });
    }

    async findById(sessionId: string): Promise<(Session & Document) | null> {
        if (!isValidObjectId(sessionId)) {
            return null;
        }
        return await SessionModel.findById(toObjectId(sessionId));
    }
}
