import { Schema, model, Document } from 'mongoose';
import { Role } from '../config/roles';

export interface User {
    email: string;
    password?: string;
    name: string;
    metadata?: Record<string, any>;
    role?: Role;
    permissions?: string[];
    createdAt?: Date;
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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

export const UserModel = model<User & Document>('User', UserSchema);
