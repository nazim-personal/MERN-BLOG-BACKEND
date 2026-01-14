import { Role } from '../config/roles';

declare global {
  namespace Express {
    interface User {
      id: string;
      role?: string;
      permissions?: string[];
      email?: string;
      [key: string]: any;
    }

    interface Request {
      sessionId?: string;
    }
  }
}
