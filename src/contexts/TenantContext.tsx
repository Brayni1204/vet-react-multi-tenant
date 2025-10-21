/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react'; // Se corrige la importación de ReactNode
import { useLocation } from 'react-router-dom';

interface TenantData {
    id: string;
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
    services: any[]; // Define a proper interface for services
}

interface TenantContextType {
    tenantData: TenantData | null;
    loading: boolean;
    error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tenantData, setTenantData] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const fetchTenantData = async () => {
            setLoading(true);
            setError(null);

            // Obtenemos el hostname (e.g., chavez.localhost) para construir la URL del backend (puerto 4000)
            const hostname = window.location.hostname;
            // 🎯 Usamos el endpoint GET /api/tenants/profile para cargar los datos del inquilino actual.
            const targetUrl = `http://${hostname}:4000/api/tenants/profile`;
            const token = localStorage.getItem('admin-token'); // Obtenemos el token de autenticación

            try {
                // Hacemos la llamada a la API con el token en los headers para autenticación
                const response = await fetch(targetUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Incluimos el token para que el backend sepa de qué admin se trata
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'No se pudo cargar el perfil de la clínica desde el API.');
                }

                const data = await response.json();
                const apiTenant = data.tenant;

                // Mapeamos la respuesta del backend a la estructura del frontend (TenantData)
                const newTenantData: TenantData = {
                    id: apiTenant.tenantId, // El slug (e.g. 'chavez') es el ID en el front
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
                    // Mantenemos services como un array vacío o el valor del API si lo trae
                    services: apiTenant.services || [],
                };

                setTenantData(newTenantData);

            } catch (err) {
                const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado al cargar la data del inquilino.';
                setError(message);
                setTenantData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTenantData();
    }, [location.pathname]);

    const value = { tenantData, loading, error };

    return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};