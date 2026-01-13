import { ActivityLogRepository } from '../repositories/activity-log.repository';

export class ActivityLogService {
    private activityLogRepository: ActivityLogRepository;

    constructor(activityLogRepository: ActivityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    async logActivity(data: {
        userId: string;
        action: string;
        resource: string;
        resourceId?: string;
        details?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return await this.activityLogRepository.create({
            user: data.userId as any,
            action: data.action,
            resource: data.resource,
            resource_id: data.resourceId,
            details: data.details,
            ip_address: data.ipAddress,
            user_agent: data.userAgent
        });
    }

    async listLogs(payload: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
    }) {
        const logs = await this.activityLogRepository.findAll({
            page: payload.page || 1,
            limit: payload.limit || 10,
            userId: payload.userId,
            action: payload.action
        });

        const total = await this.activityLogRepository.countAll(payload.userId, payload.action);

        return {
            message: 'Activity logs retrieved successfully',
            data: logs,
            pagination: {
                page: payload.page || 1,
                limit: payload.limit || 10,
                total,
                totalPages: Math.ceil(total / (payload.limit || 10))
            }
        };
    }
}
