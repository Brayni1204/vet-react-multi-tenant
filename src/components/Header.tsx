import React, { useState } from 'react';
// Usamos NavLink para poder mostrar un estado activo, pero Link también funciona
import { Link, NavLink } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext.tsx'; // .tsx añadido
// 🔽 --- AÑADIDOS --- 🔽
import {
    FaPhone, FaClock, FaMapMarkerAlt, FaBars, FaTimes,
    FaShoppingCart, FaUserCircle, FaSignOutAlt, FaBoxOpen
} from 'react-icons/fa';
import { useCart } from '../contexts/CartContext.tsx'; // .tsx añadido
import { useClientAuth } from '../contexts/ClientAuthContext.tsx'; // .tsx añadido
// 🔼 --- FIN DE AÑADIDOS --- 🔼
import '../styles/Header.css';

interface HeaderProps {
    isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
    const { tenantData, loading, error } = useTenant();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🔽 --- HOOKS DE ESTADO (CLIENTE Y CARRITO) --- 🔽
    const { totalItems } = useCart();
    const { isAuthenticated, user, logout } = useClientAuth();
    // 🔼 --- FIN DE HOOKS --- 🔼

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        // Cerramos el menú móvil si está abierto
        if (isMenuOpen) {
            toggleMenu();
        }
        logout();
    };

    const primaryColor = tenantData?.colors.primary || '#00457E';

    // Estilo para el hover (puedes pasarlo a tu CSS)
    const linkHoverStyle = { '--hover-color': tenantData?.colors.secondary || '#4CAF50' } as React.CSSProperties;

    // Componente reutilizable para el estado de login
    const AuthNav: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => (
        <>
            {isAuthenticated ? (
                <div className={mobile ? "mobile-auth-menu" : "desktop-auth-menu"}>
                    <NavLink
                        to="/mis-pedidos"
                        className={mobile ? "mobile-nav-link-icon" : "header-icon-link"}
                        title="Mis Pedidos"
                        onClick={mobile ? toggleMenu : undefined}
                    >
                        <FaBoxOpen />
                        {mobile && <span>Mis Pedidos</span>}
                    </NavLink>
                    <FaUserCircle />
                    <span className="client-name">Hola, {user?.name.split(' ')[0]}</span>
                    {/* (Opcional: enlace a perfil de cliente) 
                    <Link to="/mi-cuenta" className="profile-link">Mi Perfil</Link> 
                    */}
                    <button onClick={handleLogout} title="Cerrar Sesión" className="logout-button">
                        <FaSignOutAlt />
                        {mobile && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            ) : (
                <NavLink
                    to="/login"
                    className={mobile ? "block py-4 text-gray-700 font-medium hover:text-green-500" : "btn primary small login-btn"}
                    style={linkHoverStyle}
                    onClick={mobile ? toggleMenu : undefined}
                >
                    <FaUserCircle />
                    <span>Ingresar</span>
                </NavLink>
            )}
        </>
    );

    return (
        <>
            {/* 🎯 HEADER */}
            <header className={`sticky top-0 z-50 bg-white p-4 border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
                {/* ------------------- */}
                {/* 1. Barra de Contacto */}
                {/* ------------------- */}
                <div className={`hidden md:flex justify-end gap-6 text-sm text-gray-500 transition-opacity duration-300 ${isScrolled ? 'h-0 opacity-0 mb-0 overflow-hidden' : 'h-auto opacity-100 mb-2'}`}>
                    <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-600" /> <span>{tenantData?.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaClock className="text-gray-600" /> <span>{tenantData?.contact.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-600" /> <span>{tenantData?.contact.address}</span>
                    </div>
                </div>

                {/* ------------------- */}
                {/* 2. Barra Principal  */}
                {/* ------------------- */}
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    {/* LOGO */}
                    <Link to="/" className="text-2xl font-bold" style={{ color: primaryColor }}>
                        <h1>{tenantData?.name}</h1>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:flex items-center space-x-6">
                        <ul className="flex space-x-8" style={linkHoverStyle}>
                            <li><NavLink to="/" className="nav-link" end>Inicio</NavLink></li>
                            <li><NavLink to="/servicios" className="nav-link">Servicios</NavLink></li>
                            <li><NavLink to="/tienda" className="nav-link">Tienda</NavLink></li>
                            <li><NavLink to="/urgencias" className="nav-link">Urgencias 24/7</NavLink></li>
                            <li><NavLink to="/contacto" className="nav-link">Contacto</NavLink></li>
                        </ul>

                        <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                            <NavLink to="/checkout" className="header-icon-link cart-link" aria-label="Carrito de compras">
                                <FaShoppingCart />
                                {totalItems > 0 && (
                                    <span className="cart-badge">{totalItems}</span>
                                )}
                            </NavLink>
                            <AuthNav />
                        </div>
                    </div>

                    {/* MENU TOGGLE (MOBILE) */}
                    <div className="md:hidden flex items-center gap-4">
                        <NavLink to="/checkout" className="header-icon-link cart-link" aria-label="Carrito de compras">
                            <FaShoppingCart style={{ color: primaryColor }} />
                            {totalItems > 0 && (
                                <span className="cart-badge">{totalItems}</span>
                            )}
                        </NavLink>
                        <div className="text-2xl cursor-pointer z-50" onClick={toggleMenu} style={{ color: primaryColor }}>
                            <FaBars />
                        </div>
                    </div>
                </nav>
            </header>

            {/* ------------------- */}
            {/* 3. Menú Móvil (Off-canvas) */}
            {/* ------------------- */}
            <aside className={`fixed top-0 right-0 w-72 h-full bg-white shadow-xl transform transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <div className="text-xl font-bold" style={{ color: primaryColor }}>
                        <h1>{tenantData?.name}</h1>
                    </div>
                    <div className="text-2xl cursor-pointer" onClick={toggleMenu} style={{ color: primaryColor }}>
                        <FaTimes />
                    </div>
                </div>

                {/* Auth de Cliente (Móvil) */}
                <div className="p-4 border-b border-gray-100">
                    <AuthNav mobile={true} />
                </div>

                <ul className="list-none p-4 m-0 text-left" style={linkHoverStyle}>
                    <li><Link to="/" className="mobile-nav-link" onClick={toggleMenu}>Inicio</Link></li>
                    <li><Link to="/servicios" className="mobile-nav-link" onClick={toggleMenu}>Servicios</Link></li>
                    <li><Link to="/tienda" className="mobile-nav-link" onClick={toggleMenu}>Tienda</Link></li>
                    <li><Link to="/urgencias" className="mobile-nav-link" onClick={toggleMenu}>Urgencias 24/7</Link></li>
                    <li><Link to="/contacto" className="mobile-nav-link" onClick={toggleMenu}>Contacto</Link></li>
                    <li className="mt-4">
                        <Link
                            to="/citas"
                            className="btn primary block text-center"
                            style={{ ...linkHoverStyle, width: '100%' }}
                            onClick={toggleMenu}>
                            Agendar Cita
                        </Link>
                    </li>
                </ul>
            </aside>
            {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}></div>}
        </>
    );
};

export default Header;