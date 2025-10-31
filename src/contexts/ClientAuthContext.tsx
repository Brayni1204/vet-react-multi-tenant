/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
// src/contexts/ClientAuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTenant } from './TenantContext.tsx'; // 👈 .tsx añadido

interface ClientUser {
    id: number;
    name: string;
    email: string;
    role: 'client';
}

interface ClientAuthContextType {
    user: ClientUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (formData: any) => Promise<void>; // Simplificado
    logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const ClientAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<ClientUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { getApiUrl, tenantData } = useTenant();

    const storageKey = 'client-token';

    // Cargar token al inicio
    useEffect(() => {
        const storedToken = localStorage.getItem(storageKey);
        if (storedToken && tenantData) {
            // Validar token (simulado)
            try {
                const [tenantSlug, role, clientId] = storedToken.split(':');
                if (tenantSlug === tenantData.tenantId && role === 'client' && clientId) {
                    setToken(storedToken);
                    // En una app real, aquí harías fetch a /api/client/auth/me
                    // Por ahora, simulamos el user si el token es válido
                    setUser({ 
                        id: parseInt(clientId, 10), 
                        name: 'Cliente', // Deberíamos guardar/pedir esto
                        email: '',      // Deberíamos guardar/pedir esto
                        role: 'client' 
                    });
                } else {
                    localStorage.removeItem(storageKey);
                }
            } catch (e) {
                localStorage.removeItem(storageKey);
            }
        }
        setIsLoading(false);
    }, [tenantData]);

    const login = async (email: string, password: string) => {
        const response = await fetch(`${getApiUrl()}/client/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }
        
        localStorage.setItem(storageKey, data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (formData: any) => {
         const response = await fetch(`${getApiUrl()}/client/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al registrarse');
        }
    };

    const logout = () => {
        localStorage.removeItem(storageKey);
        setUser(null);
        setToken(null);
    };

    return (
        <ClientAuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout
        }}>
            {children}
        </ClientAuthContext.Provider>
    );
};

export const useClientAuth = () => {
    const context = useContext(ClientAuthContext);
    if (context === undefined) {
        throw new Error('useClientAuth debe usarse dentro de un ClientAuthProvider');
    }
    return context;
};
