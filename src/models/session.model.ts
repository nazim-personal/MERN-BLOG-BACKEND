import { Schema, model, Document, Types } from 'mongoose';

interface DeviceInfo {
    ip: string;
    userAgent: string;
}

export interface Session {
    userId: Types.ObjectId;
    refreshTokenHash: string;
    device: DeviceInfo;
    expiresAt: Date;
    isActive: boolean;
    concurrencyLock?: string | null;
    created_at?: Date;
}

const SessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    device: {
        ip: { type: String, required: true },
        userAgent: { type: String, required: true }
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    isActive: { type: Boolean, default: true },
    concurrencyLock: { type: String, default: null },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false
    },
    versionKey: false
});

SessionSchema.index({ userId: 1, isActive: 1 });

export const SessionModel = model<Session & Document>('Session', SessionSchema);
