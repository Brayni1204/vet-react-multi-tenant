// src/contexts/AuthContext.tsx (Versión unificada y corregida)
import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 🔑 Importamos useTenant para obtener getApiUrl
import { useTenant } from './TenantContext';

// Interfaz User con todos los campos relevantes de Staff y Client
export interface User {
    id: number;
    tenant_id: string; // Slug del tenant
    email: string;
    name: string;
    role: 'admin' | 'doctor' | 'receptionist' | 'client';
    is_admin?: boolean;
    phone?: string;
    address?: string;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    login: (email: string, password: string, isStaff: boolean) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función de ayuda para cargar el usuario desde localStorage
const getInitialUser = (): User | null => {
    const userJson = localStorage.getItem('app-user');
    return userJson ? JSON.parse(userJson) : null;
};

// Función de ayuda para obtener el token inicial
const getInitialToken = (): string | null => {
    return localStorage.getItem('app-token');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    // 🔑 Obtenemos el helper del contexto del inquilino
    const { getApiUrl } = useTenant();

    const [token, setToken] = useState<string | null>(getInitialToken());
    const [user, setUser] = useState<User | null>(getInitialUser());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setIsAuthenticated(!!token && !!user);
    }, [token, user]);

    // 🎯 Implementación del login unificado para Staff y Clients
    const login = async (email: string, password: string, isStaff: boolean): Promise<void> => {
        setError(null);

        const endpoint = isStaff ? '/auth/admin/login' : '/auth/client/login';
        // 🔑 Obtenemos la URL base correcta
        const targetUrl = `${getApiUrl()}${endpoint}`;

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error de autenticación');
            }

            // Almacenar el token y el objeto de usuario
            localStorage.setItem('app-token', data.token);

            // 🔑 SOLUCIÓN AL CONFLICTO: Guardamos el token de staff en 'admin-token'
            if (data.user.role !== 'client') {
                localStorage.setItem('admin-token', data.token);
            } else {
                localStorage.removeItem('admin-token');
            }

            localStorage.setItem('app-user', JSON.stringify(data.user));

            setToken(data.token);
            setUser(data.user);

            // Redirección post-login
            if (data.user.role === 'client') {
                navigate('/');
            } else {
                navigate('/admin/dashboard');
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        const currentToken = localStorage.getItem('app-token');
        const isStaff = user?.role !== 'client';

        if (isStaff && currentToken) {
            const logoutEndpoint = '/auth/admin/logout';
            const targetUrl = `${getApiUrl()}${logoutEndpoint}`; // Usamos getApiUrl
            try {
                await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                });
            } catch (error) {
                console.error("Error al notificar al backend sobre el cierre de sesión:", error);
            }
        }

        // Limpieza en el frontend (CRUCIAL)
        localStorage.removeItem('app-token');
        localStorage.removeItem('admin-token'); // Limpiamos la clave extra
        localStorage.removeItem('app-user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        navigate('/', { replace: true });
    };

    const value = { isAuthenticated, token, user, login, logout, error };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};