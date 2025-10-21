/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, type ReactNode } from 'react';

// Interfaz para el contexto de autenticación
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    // 🚨 logout ahora es asíncrono y devuelve una promesa
    logout: () => Promise<void>;
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

    // 🚨 Lógica de Logout actualizada para llamar al API
    const logout = async () => {
        const currentToken = localStorage.getItem('admin-token');
        const hostname = window.location.hostname;
        const targetUrl = `http://${hostname}:4000/api/auth/admin/logout`; // 🎯 Endpoint de Logout en el Backend

        // 1. Llamada al backend para invalidar el token (si existe)
        if (currentToken) {
            try {
                // Hacemos una llamada POST al backend para cerrar la sesión (opcionalmente invalidar token en DB)
                await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    // No verificamos el response.ok estrictamente aquí, ya que el objetivo principal es limpiar el frontend.
                    // Pero si quieres manejar errores silenciosamente en el log:
                });
            } catch (error) {
                console.error("Error al notificar al backend sobre el cierre de sesión:", error);
            }
        }

        // 2. Limpieza en el frontend (CRUCIAL)
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