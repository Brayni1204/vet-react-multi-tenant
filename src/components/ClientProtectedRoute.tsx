import React from 'react';
import { useClientAuth } from '../contexts/ClientAuthContext.tsx'; // 👈 .tsx añadido
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Este componente protege rutas que solo clientes logueados pueden ver
 * (ej. /checkout, /mis-pedidos).
 * Si no están logueados, los redirige a /login.
 */
const ClientProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useClientAuth();
    const location = useLocation();

    if (isLoading) {
        // Muestra un loader mientras se verifica el token
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Cargando...
            </div>
        );
    }

    if (!isAuthenticated) {
        // Guardamos la ubicación a la que intentaba ir
        // para redirigirlo de vuelta después del login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si está autenticado, renderiza la ruta hija (ej. <CheckoutPage />)
    return <Outlet />;
};

export default ClientProtectedRoute;

