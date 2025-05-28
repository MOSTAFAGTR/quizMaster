import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserRole, usersDB } from '../../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../config/jwt.config';

interface RegistrationData { email: string; password_plain: string; role: UserRole; }
interface LoginData { email: string; password_plain: string; }
interface ChangePasswordData { userId: string; currentPassword_plain: string; newPassword_plain: string; }
export interface AuthResult { success: boolean; message: string; user?: { id: string; email: string; role: UserRole }; token?: string; statusCode: number; }

export const AuthService = {
    registerUser: async (data: RegistrationData): Promise<AuthResult> => { /* ... same as before ... */ 
        const existingUser = usersDB.find(user => user.email === data.email);
        if (existingUser) return { success: false, message: 'User already exists', statusCode: 409 };
        const passwordHash = await bcrypt.hash(data.password_plain, 10);
        const newUser: User = { id: `user-${uuidv4()}`, email: data.email, passwordHash, role: data.role };
        usersDB.push(newUser);
        return { success: true, message: 'User registered', user: { id: newUser.id, email: newUser.email, role: newUser.role }, statusCode: 201 };
    },
    loginUser: async (data: LoginData): Promise<AuthResult> => { /* ... same as before ... */ 
        const user = usersDB.find(u => u.email === data.email);
        if (!user || !user.passwordHash) return { success: false, message: 'Invalid credentials', statusCode: 401 };
        const isMatch = await bcrypt.compare(data.password_plain, user.passwordHash);
        if (!isMatch) return { success: false, message: 'Invalid credentials', statusCode: 401 };
        const payload = { userId: user.id, id: user.id, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { success: true, message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role }, statusCode: 200 };
    },
    changePassword: async (data: ChangePasswordData): Promise<AuthResult> => { /* ... same as before ... */
        const userIndex = usersDB.findIndex(u => u.id === data.userId);
        if (userIndex === -1) return { success: false, message: 'User not found', statusCode: 404 };
        const userToUpdate = usersDB[userIndex];
        if (!userToUpdate.passwordHash) return { success: false, message: 'User data error', statusCode: 500 };
        const isMatch = await bcrypt.compare(data.currentPassword_plain, userToUpdate.passwordHash);
        if (!isMatch) return { success: false, message: 'Incorrect current password', statusCode: 401 };
        const newPasswordHash = await bcrypt.hash(data.newPassword_plain, 10);
        usersDB[userIndex].passwordHash = newPasswordHash;
        return { success: true, message: 'Password changed', statusCode: 200 };
    }
};