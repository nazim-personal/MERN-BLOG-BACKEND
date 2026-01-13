import { UserModel } from '../models/user.model';
import { Types } from 'mongoose';

export class UserRepository {

    async findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    async findById(userId: Types.ObjectId) {
        return UserModel.findById(new Types.ObjectId(userId));
    }

    async create(data: {
        email: string;
        password?: string;
        name?: string;
        metadata?: Record<string, any>;
    }) {
        return UserModel.create(data);
    }

    async delete(userId: string): Promise<void> {
        await UserModel.findByIdAndDelete(new Types.ObjectId(userId));
    }

    async countAll(): Promise<number> {
        return await UserModel.countDocuments();
    }

    async countByRole(role: string): Promise<number> {
        return await UserModel.countDocuments({ role });
    }

    async updateRole(userId: string, role: string) {
        return UserModel.findByIdAndUpdate(
            new Types.ObjectId(userId),
            { role },
            { new: true }
        );
    }

    async updatePermissions(userId: string, permissions: string[]) {
        return UserModel.findByIdAndUpdate(
            new Types.ObjectId(userId),
            { permissions },
            { new: true }
        );
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

        const skip = (filters.page - 1) * filters.limit;

        return UserModel.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(filters.limit)
            .select('-password')
            .exec();
    }
}
