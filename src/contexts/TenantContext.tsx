/* eslint-disable react-hooks/exhaustive-deps */
// src/contexts/TenantContext.tsx (FINAL CORRECCIÓN)
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface TenantData {
    id: number; // ID Numérico del DB
    tenantId: string; // Slug del tenant (e.g., 'chavez')
    name: string;
    logoUrl: string;
    colors: {
        primary: string;
        secondary: string;
    };
    contact: {
        phone: string;
        email: string;
        address: string;
        schedule: string;
    };
    services: any[];
}

interface TenantContextType {
    tenantData: TenantData | null;
    loading: boolean;
    error: string | null;
    // 🔑 EXPONEMOS esta función crucial
    getApiUrl: () => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Función de ayuda para obtener el slug del subdominio (e.g., 'chavez')
const getTenantSlug = () => {
    const parts = window.location.host.split('.');
    // Manejo de localhost con subdominio (ej: chavez.localhost) o sin (ej: localhost)
    if (parts.length > 2 && (parts[1] === 'localhost' || parts[1] === '127')) {
        return parts[0];
    }
    // Manejo de producción con subdominio
    if (parts.length > 2) {
        return parts[0];
    }
    // Fallback para desarrollo sin subdominio o host desconocido
    return 'chavez';
};

// 🎯 Función para obtener el URL base del backend
export const getApiUrl = (): string => {
    const tenantSlug = getTenantSlug();

    // Si el host es 'localhost' o '127.0.0.1' (frontend en 5173), construimos el host del backend con el slug.
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Asume que el backend está en el puerto 4000
        return `http://${tenantSlug}.localhost:4000/api`;
    }

    // Para cualquier otro entorno (hosts con subdominio real)
    // Extraemos solo el host (sin puerto) y le añadimos el puerto del backend.
    return `http://${window.location.host.split(':')[0]}:4000/api`;
};

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tenantData, setTenantData] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    const fetchTenantProfile = useCallback(async () => {
        setLoading(true);
        setError(null);

        // 🎯 RUTA CORREGIDA: Usa el helper global y el endpoint fijo
        const targetUrl = `${getApiUrl()}/tenants/profile`;
        const token = localStorage.getItem('app-token');

        try {
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo cargar el perfil de la clínica desde el API.');
            }

            const data = await response.json();
            const apiTenant = data.tenant;

            const processedData: TenantData = {
                id: apiTenant.id,
                tenantId: apiTenant.tenantId,
                name: apiTenant.name,
                logoUrl: apiTenant.logoUrl || '/images/default-logo.svg',
                colors: {
                    primary: apiTenant.primaryColor || '#00457E',
                    secondary: apiTenant.secondaryColor || '#2ED197',
                },
                contact: {
                    phone: apiTenant.phone,
                    email: apiTenant.email,
                    address: apiTenant.address,
                    schedule: apiTenant.schedule,
                },
                services: apiTenant.services || [],
            };

            setTenantData(processedData);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado al cargar la data del inquilino.';
            setError(message);
            setTenantData(null);
        } finally {
            setLoading(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        fetchTenantProfile();
    }, [fetchTenantProfile]);

    // 🔑 EXPONEMOS getApiUrl en el valor del contexto
    const value = { tenantData, loading, error, getApiUrl };

    return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};