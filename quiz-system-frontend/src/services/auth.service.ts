import axiosInstance from './axiosInstance';
import { User, AuthResponseData } from '../types';

interface LoginCredentials { email: string; password_plain: string; }
interface RegisterData { email: string; password_plain: string; role: 'student' | 'instructor'; }
interface ChangePasswordData { currentPassword_plain: string; newPassword_plain: string; }

const API_URL_AUTH = '/auth';

export const AuthService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponseData> => {
        const response = await axiosInstance.post<AuthResponseData>(`${API_URL_AUTH}/login`, {
            email: credentials.email, password: credentials.password_plain
        });
        return response.data;
    },
    register: async (data: RegisterData): Promise<AuthResponseData> => {
        const response = await axiosInstance.post<AuthResponseData>(`${API_URL_AUTH}/register`, {
            email: data.email, password: data.password_plain, role: data.role
        });
        return response.data;
    },
    changePassword: async (data: ChangePasswordData, token: string): Promise<AuthResponseData> => {
        const response = await axiosInstance.put<AuthResponseData>(`${API_URL_AUTH}/change-password`, {
            currentPassword: data.currentPassword_plain, newPassword: data.newPassword_plain
        }, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    }
};