import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
    private adminService: AdminService;

    constructor(adminService: AdminService) {
        this.adminService = adminService;
    }

    public getDashboardStats = async (req: Request, res: Response) => {
        try {
            const stats = await this.adminService.getDashboardStats();
            return res.status(200).json({
                message: 'Dashboard statistics retrieved successfully',
                data: stats,
                success: true
            });
        } catch (error: any) {
            return res.status(500).json({
                message: error.message || 'Error retrieving dashboard stats',
                success: false
            });
        }
    };
}
