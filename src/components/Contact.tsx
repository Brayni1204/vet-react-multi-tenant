// src/components/Contact.tsx
import React from 'react';
import '../styles/Contact.css'; // Crea este archivo de estilos

const Contact: React.FC = () => {
    return (
        <section className="contact" id="contacto">
            <div className="contact-info-container">
                <h2>Contáctanos</h2>
                <p>Estamos aquí para ayudarte. Mándanos un mensaje y nos pondremos en contacto contigo lo antes posible.</p>
                <div className="info-details">
                    <p><strong>Dirección:</strong> Ejido Viejo de Santa Ursula Coapa, Coyoacán</p>
                    <p><strong>Teléfono:</strong> +55 25 08 76 57</p>
                    <p><strong>Horario:</strong> Lunes a Sábado: 10:00 - 19:00hrs</p>
                </div>
                {/* Puedes añadir un mapa aquí, por ejemplo, un iframe de Google Maps */}
            </div>

            <div className="contact-form-container">
                <form>
                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" id="name" name="name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Mensaje</label>
                        <textarea id="message" name="message" rows={5} required></textarea>
                    </div>
                    <button type="submit" className="btn primary">Enviar mensaje</button>
                </form>
            </div>
        </section>
    );
};

export default Contact;