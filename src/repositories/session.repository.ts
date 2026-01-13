import { SessionModel, Session } from '../models/session.model';
import { Document, Types } from 'mongoose';

export class SessionRepository {
    async create(data: Partial<Session>): Promise<Session & Document> {
        return await SessionModel.create(data);
    }

    async findByRefreshTokenHash(hash: string): Promise<(Session & Document) | null> {
        return await SessionModel.findOne({ refresh_token_hash: hash, is_active: true });
    }

    async findAndLock(hash: string): Promise<(Session & Document) | null> {
        return await SessionModel.findOneAndUpdate(
            { refresh_token_hash: hash, is_active: true, concurrency_lock: null },
            { concurrency_lock: new Date().toISOString() },
            { new: true }
        );
    }

    async updateWithRotation(sessionId: any, data: Partial<Session>): Promise<void> {
        await SessionModel.findByIdAndUpdate(new Types.ObjectId(sessionId), {
            ...data,
            concurrency_lock: null
        });
    }

    async deactivateAllForUser(userId: string): Promise<void> {
        await SessionModel.updateMany({ user_id: userId, is_active: true }, { is_active: false });
    }

    async deactivateByHash(hash: string): Promise<void> {
        await SessionModel.updateOne({ refresh_token_hash: hash, is_active: true }, { is_active: false });
    }

    async deactivateById(sessionId: string): Promise<void> {
        await SessionModel.findByIdAndUpdate(new Types.ObjectId(sessionId), { is_active: false });
    }

    async findById(sessionId: string): Promise<(Session & Document) | null> {
        return await SessionModel.findById(new Types.ObjectId(sessionId));
    }
}
