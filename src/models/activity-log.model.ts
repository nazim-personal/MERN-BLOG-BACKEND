import { Schema, model, Document, Types } from 'mongoose';

export interface ActivityLog {
    user: Types.ObjectId;
    action: string;
    resource: string;
    resource_id?: string;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at?: Date;
}

const ActivityLogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resource_id: { type: String },
    details: { type: Schema.Types.Mixed },
    ip_address: { type: String },
    user_agent: { type: String }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: false // Logs are immutable
    },
    versionKey: false
});

// Indexes for efficient querying
ActivityLogSchema.index({ user: 1, created_at: -1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ created_at: -1 });

export const ActivityLogModel = model<ActivityLog & Document>('ActivityLog', ActivityLogSchema);
