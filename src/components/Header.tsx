// src/components/Header.tsx (ajustado para recibir props)
import React from 'react';
import { FaPhone, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/Header.css';
import { Link } from 'react-router-dom';

interface HeaderProps {
    isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
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
                <ul className="nav-links">
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/servicios">Servicios</Link></li> {/* O una sección dentro de Home */}
                    <li><Link to="/tienda">Tienda</Link></li>
                    <li><Link to="/urgencias">Urgencias 24/7</Link></li>
                    <li><Link to="/contacto">Contacto</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;