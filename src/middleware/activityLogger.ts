import { Request, Response, NextFunction } from 'express';

export const logActivity = (action: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user ? `${req.user.name} (${req.user.role})` : 'Anonymous';
    console.log(`[ACTIVITY] ${new Date().toISOString()} - User: ${user} - Action: ${action}`);
    next();
  };
};
