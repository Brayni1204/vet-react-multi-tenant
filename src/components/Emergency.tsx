import React from 'react';
import '../styles/Emergency.css';
import { FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Emergency: React.FC = () => {
    return (
        <section className="emergency">
            <h2>Urgencias 24/7</h2>
            <div className="emergency-content">
                <p>En caso de emergencia, nuestra clínica está disponible para atender a tu mascota en cualquier momento. No dudes en llamarnos, tu mascota es nuestra prioridad.</p>
                <div className="emergency-contact">
                    <div className="emergency-item">
                        <FaPhone className="icon" />
                        <h3>Llámanos de inmediato</h3>
                        <a href="tel:+5525087657" className="emergency-phone">+55 25 08 76 57</a>
                    </div>
                    <div className="emergency-item">
                        <FaMapMarkerAlt className="icon" />
                        <h3>Visítanos</h3>
                        <p>Ejido Viejo de Santa Ursula Coapa, Coyoacán</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Emergency;