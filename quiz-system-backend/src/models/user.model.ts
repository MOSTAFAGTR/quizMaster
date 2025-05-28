export type UserRole = 'student' | 'instructor';

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}

export const usersDB: User[] = [];