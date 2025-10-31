// Ruta: src/components/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext'; // Importamos el hook
import { FaPhone, FaClock, FaMapMarkerAlt, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Header.css';

interface HeaderProps {
    isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
    const { tenantData, loading, error } = useTenant();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Define los colores usando una variable, o usa clases estáticas si prefieres
    const primaryColor = tenantData?.colors.primary || '#00457E';

    return (
        <>
            {/* 🎯 HEADER */}
            <header className={`sticky top-0 z-50 bg-white p-4 border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
                {/* 🎯 CONTACT INFO */}
                <div className={`hidden md:flex justify-end gap-6 text-sm text-gray-500 transition-opacity duration-300 ${isScrolled ? 'h-0 opacity-0 mb-0 overflow-hidden' : 'h-auto opacity-100 mb-2'}`}>
                    <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-600" />
                        <span>{tenantData?.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaClock className="text-gray-600" />
                        <span>{tenantData?.contact.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-600" />
                        <span>{tenantData?.contact.address}</span>
                    </div>
                </div>

                {/* 🎯 NAV */}
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    {/* 🎯 LOGO */}
                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                        <h1>{tenantData?.name}</h1>
                    </div>

                    {/* 🎯 DESKTOP MENU */}
                    <div className="hidden md:block">
                        <ul className="flex space-x-8">
                            <li><Link to="/" className="text-gray-800 font-medium text-lg hover:text-green-500 transition-colors duration-300">Inicio</Link></li>
                            <li><Link to="/servicios" className="text-gray-800 font-medium text-lg hover:text-green-500 transition-colors duration-300">Servicios</Link></li>
                            <li><Link to="/tienda" className="text-gray-800 font-medium text-lg hover:text-green-500 transition-colors duration-300">Tienda</Link></li>
                            <li><Link to="/urgencias" className="text-gray-800 font-medium text-lg hover:text-green-500 transition-colors duration-300">Urgencias 24/7</Link></li>
                            <li><Link to="/contacto" className="text-gray-800 font-medium text-lg hover:text-green-500 transition-colors duration-300">Contacto</Link></li>
                        </ul>
                    </div>

                    {/* 🎯 MENU TOGGLE (MOBILE) */}
                    <div className="md:hidden text-2xl cursor-pointer z-50" onClick={toggleMenu} style={{ color: primaryColor }}>
                        <FaBars />
                    </div>
                </nav>
            </header>

            {/* 🎯 OFF-CANVAS MENU (MOBILE) */}
            <aside className={`fixed top-0 right-0 w-64 h-full bg-white shadow-xl transform transition-transform duration-300 z-9999 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <div className="text-xl font-bold" style={{ color: primaryColor }}>
                        <h1>{tenantData?.name}</h1>
                    </div>
                    <div className="text-2xl cursor-pointer" onClick={toggleMenu} style={{ color: primaryColor }}>
                        <FaTimes />
                    </div>
                </div>
                <ul className="list-none p-4 m-0 text-left" onClick={toggleMenu}>
                    <li><Link to="/" className="block py-4 text-gray-700 font-medium border-b border-gray-100 hover:text-green-500">Inicio</Link></li>
                    <li><Link to="/servicios" className="block py-4 text-gray-700 font-medium border-b border-gray-100 hover:text-green-500">Servicios</Link></li>
                    <li><Link to="/tienda" className="block py-4 text-gray-700 font-medium border-b border-gray-100 hover:text-green-500">Tienda</Link></li>
                    <li><Link to="/urgencias" className="block py-4 text-gray-700 font-medium border-b border-gray-100 hover:text-green-500">Urgencias 24/7</Link></li>
                    <li><Link to="/contacto" className="block py-4 text-gray-700 font-medium hover:text-green-500">Contacto</Link></li>
                </ul>
            </aside>
            {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-9998" onClick={toggleMenu}></div>}
        </>
    );
};

export default Header;