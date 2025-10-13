// src/components/Header.tsx
import React from 'react';
import { FaPhone, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/Header.css'; // Asegúrate de que las rutas a tus CSS sean correctas

const Header: React.FC = () => {
    return (
        <header className="header">
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
                    <li><a href="#inicio">Inicio</a></li>
                    <li><a href="#servicios">Servicios</a></li>
                    <li><a href="#">Tienda</a></li>
                    <li><a href="#">Urgencias 24/7</a></li>
                    <li><a href="#contacto">Contacto</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;