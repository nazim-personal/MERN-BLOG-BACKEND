import { Role } from '../config/roles';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions: string[];
      };
      sessionId?: string;
    }
  }
}
