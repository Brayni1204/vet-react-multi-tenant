import React, { useState } from 'react';
import '../styles/Appointment.css';

// Interfaz para el formulario de reserva
interface AppointmentForm {
    petName: string;
    petType: 'dog' | 'cat' | 'other';
    service: 'consulta' | 'vacunacion' | 'grooming' | 'cirugia';
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
}

// Interfaz para la cita
interface Appointment {
    id: number;
    petName: string;
    petType: 'dog' | 'cat' | 'other';
    service: string;
    date: string;
    time: string;
    notes?: string;
}

const AppointmentPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([
        // Datos de prueba
        { id: 1, petName: 'Max', petType: 'dog', service: 'Consulta general', date: '2025-10-20', time: '10:00', notes: 'Revisión anual' },
        { id: 2, petName: 'Luna', petType: 'cat', service: 'Vacunación', date: '2025-10-25', time: '15:30' },
    ]);
    const [isCreating, setIsCreating] = useState(false);
    const [newAppointment, setNewAppointment] = useState<AppointmentForm>({
        petName: '',
        petType: 'dog',
        service: 'consulta',
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewAppointment(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleNewAppointmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Simulamos una llamada a la API
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppointment),
            });

            if (!response.ok) {
                // Si la respuesta no es exitosa, obtenemos el mensaje de error del backend
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo agendar la cita.');
            }

            // Si la cita fue exitosa, la agregamos al estado local
            const createdAppointment: Appointment = await response.json();
            setAppointments(prevAppointments => [...prevAppointments, createdAppointment]);

            setNewAppointment({
                petName: '',
                petType: 'dog',
                service: 'consulta',
                appointmentDate: '',
                appointmentTime: '',
                notes: '',
            });
            setIsCreating(false);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="appointment-page">
            <h2>Mis Citas</h2>

            {isCreating ? (
                <div className="appointment-form-container">
                    <h3>Agendar nueva cita</h3>
                    <form onSubmit={handleNewAppointmentSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label htmlFor="petName">Nombre de la mascota</label>
                            <input
                                type="text"
                                id="petName"
                                name="petName"
                                value={newAppointment.petName}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="petType">Tipo de mascota</label>
                            <select
                                id="petType"
                                name="petType"
                                value={newAppointment.petType}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="dog">Perro</option>
                                <option value="cat">Gato</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="service">Servicio</label>
                            <select
                                id="service"
                                name="service"
                                value={newAppointment.service}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="consulta">Consulta general</option>
                                <option value="vacunacion">Vacunación</option>
                                <option value="grooming">Grooming</option>
                                <option value="cirugia">Cirugía</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="appointmentDate">Fecha</label>
                            <input
                                type="date"
                                id="appointmentDate"
                                name="appointmentDate"
                                value={newAppointment.appointmentDate}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="appointmentTime">Hora</label>
                            <input
                                type="time"
                                id="appointmentTime"
                                name="appointmentTime"
                                value={newAppointment.appointmentTime}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Notas adicionales</label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={3}
                                value={newAppointment.notes}
                                onChange={handleFormChange}
                            ></textarea>
                        </div>
                        <div className="appointment-buttons">
                            <button type="submit" className="btn primary" disabled={isLoading}>
                                {isLoading ? 'Agendando...' : 'Guardar Cita'}
                            </button>
                            <button type="button" className="btn secondary" onClick={() => setIsCreating(false)} disabled={isLoading}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <button className="btn primary" onClick={() => setIsCreating(true)}>Agendar nueva cita</button>
                    <div className="appointment-list">
                        {appointments.length > 0 ? (
                            appointments.map(appointment => (
                                <div key={appointment.id} className="appointment-card">
                                    <p><strong>Mascota:</strong> {appointment.petName} ({appointment.petType === 'dog' ? 'Perro' : appointment.petType === 'cat' ? 'Gato' : 'Otro'})</p>
                                    <p><strong>Servicio:</strong> {appointment.service}</p>
                                    <p><strong>Fecha:</strong> {appointment.date}</p>
                                    <p><strong>Hora:</strong> {appointment.time}</p>
                                    {appointment.notes && <p><strong>Notas:</strong> {appointment.notes}</p>}
                                </div>
                            ))
                        ) : (
                            <p>No tienes citas agendadas.</p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};

export default AppointmentPage;