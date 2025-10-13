import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaClock, FaMapMarkerAlt, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Header.css';

interface HeaderProps {
    isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                {/* La información de contacto se mantiene visible en desktop */}
                <div className="contact-info">
                    <div className="info-item">
                        <FaPhone />
                        <span>+55 25 08 76 57</span>
                    </div>
                    <div className="info-item">
                        <FaClock />
                        <span>L-S: 10:00 - 19:00hrs</span>
                    </div>
                    <div className="info-item">
                        <FaMapMarkerAlt />
                        <span>Ejido Viejo de Santa Ursula Coapa, Coyoacán</span>
                    </div>
                </div>

                <nav className="nav">
                    <div className="logo">
                        <h1>MEDICA<span className="logo-zoo">ZOO</span></h1>
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

                    {/* Botón de hamburguesa visible solo en móviles */}
                    <div className="menu-toggle" onClick={toggleMenu}>
                        <FaBars />
                    </div>
                </nav>
            </header>

            {/* Menú lateral (off-canvas) */}
            <aside className={`off-canvas-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="off-canvas-header">
                    <div className="logo">
                        <h1>MEDICA<span className="logo-zoo">ZOO</span></h1>
                    </div>
                    <div className="close-menu" onClick={toggleMenu}>
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