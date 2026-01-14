import { ActivityLogModel, ActivityLog } from '../models/activity-log.model';
import { Document } from 'mongoose';
import { isValidObjectId, toObjectId } from '../utils/sanitization.util';

const MAX_LIMIT = 100;

export class ActivityLogRepository {
    async create(data: Partial<ActivityLog>): Promise<ActivityLog & Document> {
        return await ActivityLogModel.create(data);
    }

    async findAll(options: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
    }): Promise<any[]> {
        const page = options.page || 1;
        const limit = Math.min(options.limit || 10, MAX_LIMIT);
        const skip = (page - 1) * limit;

        const query: any = {};
        if (options.userId) {
            if (!isValidObjectId(options.userId)) {
                return [];
            }
            query.user = toObjectId(options.userId);
        }
        if (options.action) {
            query.action = options.action;
        }

        return await ActivityLogModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('user action resource resourceId ipAddress createdAt')
            .populate('user', 'name email role')
            .lean();
    }

    async countAll(userId?: string, action?: string): Promise<number> {
        const query: any = {};
        if (userId) {
            if (!isValidObjectId(userId)) {
                return 0;
            }
            query.user = toObjectId(userId);
        }
        if (action) {
            query.action = action;
        }
        return await ActivityLogModel.countDocuments(query);
    }
}
