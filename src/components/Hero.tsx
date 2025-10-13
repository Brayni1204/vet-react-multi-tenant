// src/components/Hero.tsx
import React from 'react';
import '../styles/Hero.css';

const Hero: React.FC = () => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Cuidamos a tu <br /> mascota como si <br /> fuera nuestra</h1>
                <p>Urgencias 24/7, atención con cariño y todos los servicios en un solo lugar.</p>
                <div className="hero-buttons">
                    <button className="btn primary">Agendar servicio</button>
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