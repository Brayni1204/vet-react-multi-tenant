// src/pages/admin/AdminLayout.tsx
import React, { type PropsWithChildren, useState, useMemo, useCallback } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { FaTachometerAlt, FaClipboardList, FaClinicMedical, FaSignOutAlt, FaMoon, FaSun, FaBars, FaSearch } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
// 🆕 Importamos useTenant
import { useTenant } from '../../contexts/TenantContext';
import '../../styles/admin.css';

// 🎯 Datos del menú con iconos
const initialNavItems = [
    { to: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Panel" },
    { to: "/admin/services", icon: <FaClipboardList />, label: "Servicios" },
    { to: "/admin/profile", icon: <FaClinicMedical />, label: "Mi Clínica" },
];

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    // 🆕 Obtenemos la data del tenant y el estado de carga
    const { tenantData, loading, error } = useTenant();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // 🆕 Helper para construir la URL absoluta del logo
    const getAbsoluteUrl = useCallback((path: string) => {
        if (!path) return '/icono.png'; // Fallback a un ícono local si no hay URL
        // El TenantContext ya resuelve esto en muchos casos, pero si devuelve una ruta relativa:
        const hostname = window.location.hostname;
        return path.startsWith('http') ? path : `http://${hostname}:4000${path}`;
    }, []);

    // 🆕 Definimos valores dinámicos o de fallback
    const clinicName = tenantData?.name || 'Cargando Veterinaria...';
    // Usamos el logoUrl del tenantData y lo convertimos a una URL absoluta
    const logoSrc = getAbsoluteUrl(tenantData?.logoUrl || '/icono.png');

    // 🚨 Lógica de Logout con confirmación
    const handleLogout = async () => {
        const confirmLogout = window.confirm("¿Estás seguro de que quieres cerrar tu sesión?");

        if (confirmLogout) {
            await logout();
            navigate('/admin/login', { replace: true });
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    }

    // Lógica de filtrado/búsqueda
    const filteredNavItems = useMemo(() => {
        if (!searchQuery) return initialNavItems;
        return initialNavItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // 🆕 Manejo del estado de carga y error
    if (loading) {
        return (
            <div className="loading-screen" style={{ padding: '20px', textAlign: 'center' }}>
                Cargando datos de la clínica...
            </div>
        );
    }

    if (error || !tenantData) {
        return (
            <div className="error-screen" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                Error al cargar la configuración de la clínica: {error}
            </div>
        );
    }

    return (
        <>
            {/* Header para Móviles */}
            <header className="mobile-header">
                {/* 🎯 Logo en móvil: Dinámico */}
                <Link to="/" className="mobile-logo-link">
                    <img src={logoSrc} alt={`${clinicName} Logo`} className="mobile-logo-img" />
                    <h2>Admin</h2>
                </Link>
                <button className="menu-icon-button" onClick={toggleMobileMenu} aria-label="Abrir menú">
                    <FaBars />
                </button>
            </header>

            <div className="admin-layout">
                <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>

                    {/* 🎯 Nuevo Buscador de Opciones */}
                    <div className="search-bar-sidebar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar opción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <nav className="admin-nav">
                        <ul>
                            {filteredNavItems.length > 0 ? (
                                filteredNavItems.map(item => (
                                    <li key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            onClick={isMobileMenuOpen ? toggleMobileMenu : undefined}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </li>
                                ))
                            ) : (
                                <li className="no-results">No se encontraron opciones.</li>
                            )}
                        </ul>
                    </nav>

                    {/* Footer de la barra lateral con Toggle de Tema y Logout */}
                    <div className="sidebar-footer">
                        <div className="theme-toggle-container">
                            <span className="theme-toggle-label">
                                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                            </span>
                            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Cambiar tema">
                                {theme === 'dark' ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>

                        {/* 🚨 Usamos handleLogout con confirmación */}
                        <button onClick={handleLogout}>
                            <FaSignOutAlt />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>

                {isMobileMenuOpen && (
                    <div className="off-canvas-overlay" onClick={toggleMobileMenu}></div>
                )}

                <main className="admin-content">
                    {children}
                </main>
            </div>
        </>
    );
};

export default AdminLayout;