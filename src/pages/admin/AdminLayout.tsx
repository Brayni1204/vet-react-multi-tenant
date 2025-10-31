// src/pages/admin/AdminLayout.tsx (Modificado)
import React, { type PropsWithChildren, useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// 🆕 Importamos FaUsers
import { FaTachometerAlt, FaClipboardList, FaClinicMedical, FaSignOutAlt, FaMoon, FaSun, FaBars, FaSearch, FaUsers, FaTags, FaBoxOpen } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import '../../styles/admin.css';

// 🎯 Datos del menú con iconos (AÑADIMOS 'staff')
const initialNavItems = [
    { to: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Panel" },
    { to: "/admin/services", icon: <FaClipboardList />, label: "Servicios" },
    // 🆕 Añadir la ruta de gestión de personal - Su visibilidad se controlará más abajo
    { to: "/admin/categories", icon: <FaTags />, label: "Categorías" },
    { to: "/admin/products", icon: <FaBoxOpen />, label: "Productos" },
    // --- 🔼 AÑADIDO ---
    { to: "/admin/staff", icon: <FaUsers />, label: "Personal" },
    { to: "/admin/profile", icon: <FaClinicMedical />, label: "Mi Clínica" },
];

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    // ⚠️ Obtenemos el objeto `user` del contexto, es CRUCIAL.
    const { logout, user } = useAuth();
    const { tenantData, loading, error } = useTenant();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const clinicName = tenantData?.name || 'Cargando Veterinaria...';
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

    // 🎯 Lógica de filtrado/búsqueda y RESTRICCIÓN DE ROLES
    const filteredNavItems = useMemo(() => {
        // 1. Definimos las rutas que SÓLO el admin puede ver
        const adminOnlyRoutes = [
            "/admin/staff",
            "/admin/categories",
            "/admin/products"
        ];
        // 2. Aplicamos la restricción de rol
        const roleFiltered = initialNavItems.filter(item => {
            // Si la ruta NO está en la lista de admin-only, mostrarla siempre.
            if (!adminOnlyRoutes.includes(item.to)) {
                return true;
            }
            // Si la ruta SÍ ESTÁ en la lista, solo mostrarla si el user.role es 'admin'.
            return user?.role === 'admin';
        });
        // 3. Aplicamos el filtro de búsqueda sobre la lista ya filtrada por rol
        if (!searchQuery) return roleFiltered;
        return roleFiltered.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, user?.role]); // Dependemos del rol del usuario

    if (loading) {
        return (
            <div className="loading-screen" style={{ padding: '20px', textAlign: 'center' }}>
                Cargando datos de la clínica...
            </div>
        );
    }

    // Verificamos si hay error o si el usuario no tiene permiso (aunque ProtectedRoute debería manejarlo)
    if (error || !tenantData) {
        return (
            <div className="error-screen" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                Error al cargar la configuración de la clínica: {error}
            </div>
        );
    }

    return (
        <>
            {/* Header para Móviles (Sin cambios) */}
            <header className="mobile-header">
                <h2 className="logo-text">{clinicName}</h2>
                <button className="menu-icon-button" onClick={toggleMobileMenu} aria-label="Abrir menú">
                    <FaBars />
                </button>
            </header>

            <div className="admin-layout">
                <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>

                    {/* Buscador de Opciones (Sin cambios) */}
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
                            {/* 🎯 Usamos filteredNavItems que aplica la restricción de rol */}
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

                    {/* Footer de la barra lateral con Toggle de Tema y Logout (Sin cambios en esta parte) */}
                    <div className="sidebar-footer">
                        <div className="theme-toggle-container">
                            <span className="theme-toggle-label">
                                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                            </span>
                            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Cambiar tema">
                                {theme === 'dark' ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>

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