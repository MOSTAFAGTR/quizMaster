// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types'; // Import User type

interface AuthState {
    token: string | null; user: User | null; isAuthenticated: boolean; isLoading: boolean;
    login: (token: string, userData: User) => void; logout: () => void;
}
const AuthContext = createContext<AuthState | undefined>(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
interface AuthProviderProps { children: ReactNode; }
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        const storedToken = localStorage.getItem('quizToken');
        const storedUserString = localStorage.getItem('quizUser');
        if (storedToken && storedUserString) {
            try {
                const storedUser = JSON.parse(storedUserString) as User;
                setToken(storedToken); setUser(storedUser); setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('quizToken'); localStorage.removeItem('quizUser');
            }
        }
        setIsLoading(false);
    }, []);
    const login = (newToken: string, userData: User) => {
        localStorage.setItem('quizToken', newToken); localStorage.setItem('quizUser', JSON.stringify(userData));
        setToken(newToken); setUser(userData); setIsAuthenticated(true);
    };
    const logout = () => {
        localStorage.removeItem('quizToken'); localStorage.removeItem('quizUser');
        setToken(null); setUser(null); setIsAuthenticated(false);
    };
    if (isLoading) return <div>Loading authentication...</div>;
    return <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>;
};