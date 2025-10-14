/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, type ReactNode } from 'react';

// Interfaz para el contexto de autenticación
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Inicializamos el estado de autenticación leyendo del localStorage
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('admin-token'));
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin-token'));

    const login = (newToken: string) => {
        localStorage.setItem('admin-token', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('admin-token');
        setToken(null);
        setIsAuthenticated(false);
    };

    const value = { isAuthenticated, token, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};