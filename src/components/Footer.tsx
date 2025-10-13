// src/components/Footer.tsx
import React from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import '../styles/Footer.css'; // Asegúrate de que la ruta sea correcta

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
                        <li><a href="#">Inicio</a></li>
                        <li><a href="#">Servicios</a></li>
                        <li><a href="#">Tienda</a></li>
                        <li><a href="#">Urgencias 24/7</a></li>
                        <li><a href="#">Contacto</a></li>
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