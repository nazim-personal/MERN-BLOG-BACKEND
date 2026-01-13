import { ActivityLogModel, ActivityLog } from '../models/activity-log.model';
import { Document } from 'mongoose';

export class ActivityLogRepository {
    async create(data: Partial<ActivityLog>): Promise<ActivityLog & Document> {
        return await ActivityLogModel.create(data);
    }

    async findAll(options: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
    }): Promise<(ActivityLog & Document)[]> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (options.userId) {
            query.user = options.userId;
        }
        if (options.action) {
            query.action = options.action;
        }

        return await ActivityLogModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email role');
    }

    async countAll(userId?: string, action?: string): Promise<number> {
        const query: any = {};
        if (userId) {
            query.user = userId;
        }
        if (action) {
            query.action = action;
        }
        return await ActivityLogModel.countDocuments(query);
    }
}
