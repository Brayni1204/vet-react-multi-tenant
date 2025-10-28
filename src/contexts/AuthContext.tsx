// src/contexts/AuthContext.tsx (Versión unificada y corregida)
import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 🚨 Definimos API_BASE_URL (Ajusta el puerto si es necesario)
const API_BASE_URL = 'http://localhost:4000/api';
// 🆕 Interfaz User con todos los campos relevantes de Staff y Client
export interface User {
    id: number;
    tenant_id: string; // Slug del tenant
    email: string;
    name: string;
    role: 'admin' | 'doctor' | 'receptionist' | 'client';
    is_admin?: boolean; // Debería ser redundante con role, pero lo mantenemos si el backend lo retorna
    phone?: string;
    address?: string;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    login: (email: string, password: string, isStaff: boolean) => Promise<void>; // 🎯 Login modificado
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
    const [token, setToken] = useState<string | null>(getInitialToken());
    const [user, setUser] = useState<User | null>(getInitialUser());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
    const [error, setError] = useState<string | null>(null);


    // Sincronizar el estado de autenticación al montar y al cambiar token/user
    useEffect(() => {
        setIsAuthenticated(!!token && !!user);
    }, [token, user]);

    // 🎯 Implementación del login unificado para Staff y Clients
    const login = async (email: string, password: string, isStaff: boolean): Promise<void> => {
        setError(null);
        // NOTA: En un entorno de desarrollo, el hostname puede ser 'localhost'. 
        // Seleccionamos el endpoint basado en si es Staff o Cliente
        const endpoint = isStaff ? '/auth/admin/login' : '/auth/client/login';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Si falla el login, lanzamos un error con el mensaje de la API
                throw new Error(data.message || 'Error de autenticación');
            }
            // Almacenar el token y el objeto de usuario (incluyendo el rol)
            localStorage.setItem('app-token', data.token);
            localStorage.setItem('app-user', JSON.stringify(data.user));

            setToken(data.token);
            setUser(data.user);

            // Navegación post-login (puede ser movida fuera de aquí, pero es una opción)
            if (data.user.role === 'client') {
                navigate('/');
            } else {
                navigate('/admin/dashboard');
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            throw err; // Re-lanzar para que Login.tsx lo maneje
        }
    };

    const logout = async () => {
        const currentToken = localStorage.getItem('app-token');
        // Asumimos que solo el personal usa un endpoint de logout en el backend
        const isStaff = user?.role !== 'client';
        if (isStaff) {
            const logoutEndpoint = '/auth/admin/logout';
            const targetUrl = `${API_BASE_URL}${logoutEndpoint}`;
            if (currentToken) {
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
        }

        // Limpieza en el frontend (CRUCIAL)
        localStorage.removeItem('app-token');
        localStorage.removeItem('app-user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };
    // 🆕 Exportamos el user y el error
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