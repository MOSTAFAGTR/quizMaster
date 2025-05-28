import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthResult } from './auth.service';
import { UserRole } from '../../models/user.model';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const AuthController = {
    register: async (req: Request, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */ 
        try {
            const { email, password, role } = req.body;
            if (!email || !password || !role) { res.status(400).json({ message: 'All fields required' }); return; }
            if (role !== 'student' && role !== 'instructor') { res.status(400).json({ message: 'Invalid role' }); return; }
            if (password.length < 6) { res.status(400).json({ message: "Password too short" }); return; }
            const result: AuthResult = await AuthService.registerUser({ email, password_plain: password, role: role as UserRole });
            res.status(result.statusCode).json(result.success ? { message: result.message, user: result.user } : { message: result.message });
        } catch (error) { next(error); }
    },
    login: async (req: Request, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */ 
        try {
            const { email, password } = req.body;
            if (!email || !password) { res.status(400).json({ message: 'Email/password required' }); return; }
            const result: AuthResult = await AuthService.loginUser({ email, password_plain: password });
            res.status(result.statusCode).json(result.success ? { message: result.message, token: result.token, user: result.user } : { message: result.message });
        } catch (error) { next(error); }
    },
    changePassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */
        try {
            const { currentPassword, newPassword } = req.body;
            if (!req.user || !req.user.userId) { res.status(401).json({ message: "User not identified" }); return; }
            if (!currentPassword || !newPassword) { res.status(400).json({ message: 'Passwords required' }); return; }
            if (newPassword.length < 6) { res.status(400).json({ message: "New password too short" }); return; }
            if (newPassword === currentPassword) { res.status(400).json({ message: "New password same as old" }); return; }
            const result: AuthResult = await AuthService.changePassword({ userId: req.user.userId, currentPassword_plain: currentPassword, newPassword_plain: newPassword });
            res.status(result.statusCode).json({ message: result.message });
        } catch (error) { next(error); }
    }
};