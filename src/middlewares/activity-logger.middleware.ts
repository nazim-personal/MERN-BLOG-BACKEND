import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from '../services/activity-log.service';


export const createActivityLogger = (activityLogService: ActivityLogService) => {
    return (action: string, resource: string) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const originalJson = res.json;

            res.json = function (body) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const userId = req.user?.id;
                    if (userId) {
                        // Extract resource ID if available in params or body
                        const resourceId = req.params.postId || req.params.commentId || req.params.userId || (body.data && body.data.id) || (body.data && body.data.id);

                        activityLogService.logActivity({
                            userId,
                            action,
                            resource,
                            resourceId: resourceId?.toString(),
                            details: {
                                method: req.method,
                                url: req.originalUrl,
                                body: req.method !== 'GET' ? req.body : undefined,
                                query: req.query
                            },
                            ipAddress: req.ip,
                            userAgent: req.get('User-Agent')
                        }).catch(err => console.error('Failed to log activity:', err));
                    }
                }
                return originalJson.call(this, body);
            };

            next();
        };
    };
};
