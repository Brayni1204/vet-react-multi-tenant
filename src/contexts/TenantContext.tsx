/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

            const pathParts = location.pathname.split('/');
            const tenantId = pathParts.length > 1 && pathParts[1] ? pathParts[1] : 'default-vet'; // Fallback to a default tenant

            try {
                // Here you would make a real API call. We'll simulate it for now.
                // For example: `const response = await fetch(`/api/tenants/${tenantId}`);`
                // Then, parse the response.

                // Simulating data fetching
                if (tenantId === 'chavez-vet') {
                    setTenantData({
                        id: 'chavez-vet',
                        name: 'Clínica Veterinaria Chávez',
                        logoUrl: '/images/chavez-logo.svg',
                        colors: {
                            primary: '#3A5A40',
                            secondary: '#A3B18A',
                        },
                        contact: {
                            phone: '+52 55 1234 5678',
                            email: 'info@chavez-vet.com',
                            address: 'Avenida Siempre Viva 742, Ciudad de México',
                            schedule: 'L-V: 9:00 - 18:00hrs',
                        },
                        services: [
                            { title: 'Consulta Veterinaria', description: 'Atención médica integral', image: '/images/chavez-consulta.jpg' },
                            // Add more services specific to 'chavez-vet'
                        ],
                    });
                } else {
                    // Default tenant data (MedicaZoo)
                    setTenantData({
                        id: 'default-vet',
                        name: 'MedicaZoo',
                        logoUrl: '/images/medica-zoo-logo.svg',
                        colors: {
                            primary: '#00457E',
                            secondary: '#2ED197',
                        },
                        contact: {
                            phone: '+55 25 08 76 57',
                            email: 'contacto@medicazoo.com',
                            address: 'Ejido Viejo de Santa Ursula Coapa, Coyoacán',
                            schedule: 'L-S: 10:00 - 19:00hrs',
                        },
                        services: [
                            // Default services
                            { title: 'Servicio Médico', description: 'Consultas generales', image: '/images/servicio-medico.jpg' },
                            { title: 'Grooming', description: 'Baño, corte, etc.', image: '/images/grooming.jpg' }
                        ],
                    });
                }
            } catch (err) {
                setError('Failed to load tenant data.');
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