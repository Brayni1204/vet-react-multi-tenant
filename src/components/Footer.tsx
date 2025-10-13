// src/components/Footer.tsx
import React from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import '../styles/Footer.css';
import { Link } from 'react-router-dom'; // Importa el componente Link

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section logo-section">
                    <div className="logo">
                        <h2>MEDICA<span className="logo-zoo">ZOO</span></h2>
                    </div>
                    <p>© 2025 MedicaZoo. Todos los derechos reservados</p>
                </div>

                <div className="footer-section">
                    <h3>Navegación</h3>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/servicios">Servicios</Link></li>
                        <li><Link to="/tienda">Tienda</Link></li>
                        <li><Link to="/urgencias">Urgencias 24/7</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Síguenos</h3>
                    <div className="social-links">
                        <a href="#"><FaFacebook /></a>
                        <a href="#"><FaInstagram /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Ubicación</h3>
                    <p>
                        Ejido Viejo de Santa Úrsula Coapa, <br />
                        Coyoacán, Ciudad de México <br />
                        Número celular: +55 25 06 76 57
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;