import { UserModel } from '../models/user.model';
import { Types } from 'mongoose';
import { isValidObjectId, toObjectId } from '../utils/sanitization.util';
import { Role } from '../config/roles';

const MAX_LIMIT = 100;

export class UserRepository {

    async findByEmail(email: string) {
        return UserModel.findOne({ email }).lean();
    }

    async findById(userId: Types.ObjectId | string) {
        if (typeof userId === 'string' && !isValidObjectId(userId)) {
            return null;
        }
        const id = typeof userId === 'string' ? toObjectId(userId) : userId;
        return UserModel.findById(id).lean();
    }

    async create(data: {
        email: string;
        password?: string;
        name?: string;
        metadata?: Record<string, any>;
        permissions?: string[];
    }) {
        return UserModel.create(data);
    }

    async update(userId: string, data: { name?: string; role?: Role; permissions?: string[] }) {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID');
        }
        return UserModel.findByIdAndUpdate(
            toObjectId(userId),
            { $set: data },
            { new: true, runValidators: true }
        ).select('-password').lean();
    }

    async delete(userId: string): Promise<void> {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID');
        }
        await UserModel.findByIdAndDelete(toObjectId(userId));
    }

    async countAll(): Promise<number> {
        return await UserModel.countDocuments();
    }

    async countByRole(role: string): Promise<number> {
        return await UserModel.countDocuments({ role });
    }

    async updateRole(userId: string, role: string) {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID');
        }
        return UserModel.findByIdAndUpdate(
            toObjectId(userId),
            { role },
            { new: true }
        ).select('-password').lean();
    }

    async updatePermissions(userId: string, permissions: string[]) {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID');
        }
        return UserModel.findByIdAndUpdate(
            toObjectId(userId),
            { permissions },
            { new: true }
        ).select('-password').lean();
    }

    async findAll(filters: {
        page: number;
        limit: number;
        role?: string;
    }) {
        const query: any = {};
        if (filters.role) {
            query.role = filters.role;
        }

        const limit = Math.min(filters.limit, MAX_LIMIT);
        const skip = (filters.page - 1) * limit;

        return UserModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-password')
            .lean()
            .exec();
    }
}
