import { Request as ExpressRequest, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config';
import { User } from '../models/user.model';

export interface AuthenticatedRequest extends ExpressRequest {
    user?: Pick<User, 'id' | 'email' | 'role'> & { userId: string };
}
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as Pick<User, 'id' | 'email' | 'role'> & { userId: string; iat: number; exp: number };
            req.user = { userId: decoded.userId, id: decoded.id || decoded.userId, email: decoded.email, role: decoded.role };
            next(); 
        } catch (error) { res.status(401).json({ message: 'Not authorized, token failed/expired' }); return; }
    } else { res.status(401).json({ message: 'Not authorized, no token' }); return; }
};
export const authorizeInstructor = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'instructor') { next(); } 
    else { res.status(403).json({ message: 'Forbidden: Instructor access required' }); return; }
};