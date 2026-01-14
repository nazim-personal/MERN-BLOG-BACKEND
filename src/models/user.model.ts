import { Schema, model, Document } from 'mongoose';
import { Role } from '../config/roles';

export interface User {
    email: string;
    password?: string;
    googleId?: string;
    facebookId?: string;
    name: string;
    metadata?: Record<string, any>;
    role?: Role;
    permissions?: string[];
    createdAt?: Date;
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    name: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    permissions: { type: [String], default: [] }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: false
    },
    versionKey: false
});

// Compound index for admin queries (list users by role)
UserSchema.index({ role: 1, createdAt: -1 });

// Partial indexes for social login (only index non-null values)
UserSchema.index({ googleId: 1 }, { sparse: true, unique: true });
UserSchema.index({ facebookId: 1 }, { sparse: true, unique: true });

export const UserModel = model<User & Document>('User', UserSchema);
