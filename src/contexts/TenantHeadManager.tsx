// src/components/TenantHeadManager.tsx
import React, { useEffect, useCallback } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'Vet Multi-Tenant';
const DEFAULT_ICON_PATH = '/icono.png'; // Icono por defecto en la carpeta public

const TenantHeadManager: React.FC = () => {
    const { tenantData, loading } = useTenant();
    const location = useLocation();
    const currentHostname = window.location.hostname;

    // Helper para obtener la URL completa de un asset del backend
    // Si la ruta es relativa ('/uploads/...'), la hace absoluta. Si ya es absoluta, la devuelve.
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
        // El título por defecto se usa mientras cargan los datos.
        let dynamicTitle = DEFAULT_TITLE;
        let dynamicIconUrl = DEFAULT_ICON_PATH;

        // Si los datos del tenant ya cargaron, usamos el nombre de la clínica
        if (!loading && tenantData) {
            // 1. Título: Usamos el nombre del tenant
            dynamicTitle = tenantData.name;

            // 2. Favicon: Lógica dinámica/fallback
            const isRootPublicPage = location.pathname === '/';

            if (!isRootPublicPage) {
                // Si NO estamos en la página raíz, usamos el logo del tenant (resolviendo a URL absoluta)
                // Si logoUrl es null, usamos el icono por defecto.
                dynamicIconUrl = getAbsoluteAssetUrl(tenantData.logoUrl || DEFAULT_ICON_PATH);
            }
            // Si isRootPublicPage es true, dynamicIconUrl permanece como DEFAULT_ICON_PATH
        }

        // Aplicar cambios al DOM
        document.title = dynamicTitle;
        updateFavicon(dynamicIconUrl);

        // Aseguramos que se ejecute cuando cambien los datos del tenant O la ruta
    }, [tenantData, loading, location.pathname, getAbsoluteAssetUrl]);

    return null;
};

export default TenantHeadManager;