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

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="contact-info">
                    <div className="info-item">
                        <FaPhone />
                        <span>{tenantData?.contact.phone}</span>
                    </div>
                    <div className="info-item">
                        <FaClock />
                        <span>{tenantData?.contact.schedule}</span>
                    </div>
                    <div className="info-item">
                        <FaMapMarkerAlt />
                        <span>{tenantData?.contact.address}</span>
                    </div>
                </div>

                <nav className="nav">
                    <div className="logo" style={{ color: tenantData?.colors.primary }}>
                        <h1>{tenantData?.name}</h1>
                    </div>
                    <div className="desktop-menu">
                        <ul className="nav-links">
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/servicios">Servicios</Link></li>
                            <li><Link to="/tienda">Tienda</Link></li>
                            <li><Link to="/urgencias">Urgencias 24/7</Link></li>
                            <li><Link to="/contacto">Contacto</Link></li>
                        </ul>
                    </div>

                    <div className="menu-toggle" onClick={toggleMenu} style={{ color: tenantData?.colors.primary }}>
                        <FaBars />
                    </div>
                </nav>
            </header>

            <aside className={`off-canvas-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="off-canvas-header">
                    <div className="logo" style={{ color: tenantData?.colors.primary }}>
                        <h1>{tenantData?.name}</h1>
                    </div>
                    <div className="close-menu" onClick={toggleMenu} style={{ color: tenantData?.colors.primary }}>
                        <FaTimes />
                    </div>
                </div>
                <ul className="off-canvas-links" onClick={toggleMenu}>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/servicios">Servicios</Link></li>
                    <li><Link to="/tienda">Tienda</Link></li>
                    <li><Link to="/urgencias">Urgencias 24/7</Link></li>
                    <li><Link to="/contacto">Contacto</Link></li>
                </ul>
            </aside>
            {isMenuOpen && <div className="off-canvas-overlay" onClick={toggleMenu}></div>}
        </>
    );
};

export default Header;