// src/components/WhyUs.tsx
import React, { type JSX } from 'react';
import { FaCheckCircle, FaStar, FaMapMarkerAlt, FaHeartbeat } from 'react-icons/fa'; // Ejemplo de íconos
import '../styles/WhyUs.css'; // Asegúrate de que la ruta sea correcta

// Definimos la interfaz para los datos de un punto a favor
interface WhyUsItem {
    icon: JSX.Element;
    text: string;
}

// Datos de prueba para la sección
const whyUsData: WhyUsItem[] = [
    { icon: <FaCheckCircle />, text: 'Todos los servicios en un solo lugar' },
    { icon: <FaStar />, text: 'Atención en clínica y a domicilio' },
    { icon: <FaMapMarkerAlt />, text: 'Seguimiento post-atención' },
    { icon: <FaHeartbeat />, text: 'Veterinarios certificados y apasionados' },
];

const WhyUs: React.FC = () => {
    return (
        <section className="why-us">
            <div className="why-us-intro">
                <h2>¿Por qué traer a tu mascota con <span className="highlight">nosotros</span>?</h2>
            </div>
            <div className="why-us-grid">
                {whyUsData.map((item, index) => (
                    <div key={index} className="why-us-item">
                        <div className="icon-box">
                            {item.icon}
                        </div>
                        <p>{item.text}</p>
                    </div>
                ))}
            </div>
            <div className="call-to-action">
                <h2>¿Listo para cuidar a tu mascota como se merece?</h2>
                <div className="cta-buttons">
                    <button className="btn primary">Agenda tu cita</button>
                    <button className="btn secondary">Tengo una urgencia</button>
                </div>
            </div>
        </section>
    );
};

export default WhyUs;