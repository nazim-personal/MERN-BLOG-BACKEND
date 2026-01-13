import { Schema, model, Document, Types } from 'mongoose';

export interface ActivityLog {
    user: Types.ObjectId;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}

const ActivityLogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: false // Logs are immutable
    },
    versionKey: false
});

// Indexes for efficient querying
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLogModel = model<ActivityLog & Document>('ActivityLog', ActivityLogSchema);
