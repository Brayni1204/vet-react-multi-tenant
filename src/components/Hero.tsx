import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';

const Hero: React.FC = () => {
    const navigate = useNavigate();

    const handleAgendarClick = () => {
        // En una aplicación real, aquí verificarías el estado de autenticación.
        const isAuthenticated = false; // Simulación: cambiar a true si el usuario está logueado

        if (isAuthenticated) {
            navigate('/citas'); // Redirige a la página de citas
        } else {
            navigate('/login'); // Redirige a la página de login si no está autenticado
        }
    };

    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Cuidamos a tu <br /> mascota como si <br /> fuera nuestra</h1>
                <p>Urgencias 24/7, atención con cariño y todos los servicios en un solo lugar.</p>
                <div className="hero-buttons">
                    <button className="btn primary" onClick={handleAgendarClick}>Agendar servicio</button>
                    <button className="btn secondary">Tengo una urgencia</button>
                </div>
            </div>
            <div className="hero-image">
                <img src="/images/pexels.jpg" alt="Perro de la veterinaria" />
            </div>
        </section>
    );
};

export default Hero;