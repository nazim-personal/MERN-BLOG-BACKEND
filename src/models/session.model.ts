import { Schema, model, Document, Types } from 'mongoose';

interface DeviceInfo {
    ip: string;
    user_agent: string;
}

export interface Session {
    user_id: Types.ObjectId;
    refresh_token_hash: string;
    device: DeviceInfo;
    expires_at: Date;
    is_active: boolean;
    concurrency_lock?: string | null;
    created_at?: Date;
}

const SessionSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refresh_token_hash: { type: String, required: true },
    device: {
        ip: { type: String, required: true },
        user_agent: { type: String, required: true }
    },
    expires_at: { type: Date, required: true, index: { expires: 0 } },
    is_active: { type: Boolean, default: true },
    concurrency_lock: { type: String, default: null },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false
    },
    versionKey: false
});

SessionSchema.index({ user_id: 1, is_active: 1 });

export const SessionModel = model<Session & Document>('Session', SessionSchema);
