// src/components/TenantHeadManager.tsx
import React, { useEffect, useCallback } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'Veterinaria';
const DEFAULT_ICON_PATH = '/icono.png';

const TenantHeadManager: React.FC = () => {
    const { tenantData, loading } = useTenant();
    const location = useLocation();
    const currentHostname = window.location.hostname;

    // Helper para obtener la URL completa de un asset del backend
    const getAbsoluteAssetUrl = useCallback((path: string) => {
        if (!path || path.startsWith('http')) return path;
        const backendPort = 4000;
        return `http://${currentHostname}:${backendPort}${path}`;
    }, [currentHostname]);

    // Helper para actualizar el favicon en el DOM
    const updateFavicon = (url: string) => {
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.type = 'image/png';
        link.href = url;
    };

    useEffect(() => {
        let dynamicTitle = DEFAULT_TITLE;
        let dynamicIconUrl = DEFAULT_ICON_PATH;

        // 🔑 REGLA CRUCIAL: Solo se aplica el nombre del tenant si el hostname parece ser un subdominio.
        // Un hostname que es solo 'localhost' o '127.0.0.1' NO es un subdominio.
        const isDynamicTenantHost = !(currentHostname === 'localhost' || currentHostname === '127.0.0.1');

        // 1. Si los datos han cargado
        if (!loading && tenantData) {

            // 2. Si el host es localhost SIN subdominio, forzamos el nombre por defecto.
            // Esto cumple: http://localhost:5173/ SIEMPRE muestra DEFAULT_TITLE.
            if (isDynamicTenantHost) {
                // 3. En cualquier otro caso (con subdominio o subruta), usamos el nombre dinámico.
                // Esto cubre: chavez.localhost:5173/ y chavez.localhost:5173/servicios.
                dynamicTitle = tenantData.name;

                // Usamos el logo del tenant (resolviendo a URL absoluta).
                // El favicon vuelve al icono por defecto solo en la página raíz pública.
                if (location.pathname === '/') {
                    // Si es un subdominio, mostramos el logo del tenant incluso en la raíz.
                    dynamicIconUrl = getAbsoluteAssetUrl(tenantData.logoUrl || DEFAULT_ICON_PATH);
                } else {
                    // Para subrutas (servicios, admin, etc.), usamos el logo del tenant.
                    dynamicIconUrl = getAbsoluteAssetUrl(tenantData.logoUrl || DEFAULT_ICON_PATH);
                }
            }
            // Si es localhost puro (no isDynamicTenantHost), dynamicTitle y dynamicIconUrl 
            // se mantienen como DEFAULT_TITLE y DEFAULT_ICON_PATH.

        }
        // Si loading es true o tenantData es null, se usa el DEFAULT_TITLE.

        // Aplicar cambios al DOM
        document.title = dynamicTitle;
        updateFavicon(dynamicIconUrl);

    }, [tenantData, loading, location.pathname, currentHostname, getAbsoluteAssetUrl]);

    return null;
};

export default TenantHeadManager;