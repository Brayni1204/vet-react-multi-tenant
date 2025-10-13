// src/components/Services.tsx
import React from 'react';
import '../styles/Services.css';

// Definimos la interfaz para los datos de un servicio
interface Service {
    title: string;
    description: string;
    image: string;
    actionText: string;
}

// Puedes crear un array con datos de prueba
const servicesData: Service[] = [
    {
        title: 'Servicio Médico',
        description: 'Consultas generales y especializadas, vacunas y desparasitación.',
        image: './images/service_01.jpg', // Asegúrate de tener esta imagen en tu carpeta `public`
        actionText: 'Agendar consulta',
    },
    {
        title: 'Grooming',
        description: 'Baño, corte, limpieza de oídos y uñas.',
        image: '/images/gustavo.jpg',
        actionText: 'Agendar Grooming',
    },
    // Agrega el tercer servicio aquí
];

const Services: React.FC = () => {
    return (
        <section className="services" id="servicios">
            <h2>Nuestros <span className="highlight">servicios</span></h2>
            <div className="services-container">
                {servicesData.map((service, index) => (
                    <div key={index} className="service-item">
                        <div className="service-image-wrapper">
                            <img src={service.image} alt={service.title} />
                        </div>
                        <div className="service-content">
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                            <button className="btn primary small">{service.actionText}</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Services;