import React, { useState } from 'react';
import '../../styles/admin.css';

// Interfaz para los datos del perfil de la clínica
interface ClinicProfile {
    name: string;
    address: string;
    phone: string;
    schedule: string;
    email: string;
}

const ProfileAdmin: React.FC = () => {
    const [profile, setProfile] = useState<ClinicProfile>({
        name: 'Clínica Veterinaria Chávez',
        address: 'Avenida Siempre Viva 742, Ciudad de México',
        phone: '+52 55 1234 5678',
        schedule: 'L-V: 9:00 - 18:00hrs',
        email: 'info@chavez-vet.com',
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handleSave = () => {
        // Lógica para guardar la información en el backend
        console.log("Guardando cambios:", profile);
        setIsEditing(false);
    };

    return (
        <div className="profile-admin-page">
            <h2>Mi Clínica</h2>
            <div className="profile-card">
                {isEditing ? (
                    <div className="profile-edit-form">
                        <div className="form-group">
                            <label htmlFor="name">Nombre de la Clínica</label>
                            <input type="text" name="name" value={profile.name} onChange={handleEditChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Dirección</label>
                            <input type="text" name="address" value={profile.address} onChange={handleEditChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Teléfono</label>
                            <input type="text" name="phone" value={profile.phone} onChange={handleEditChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="schedule">Horario</label>
                            <input type="text" name="schedule" value={profile.schedule} onChange={handleEditChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input type="email" name="email" value={profile.email} onChange={handleEditChange} />
                        </div>
                        <div className="profile-actions">
                            <button className="btn primary" onClick={handleSave}>Guardar</button>
                            <button className="btn secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-details">
                        <p><strong>Nombre:</strong> {profile.name}</p>
                        <p><strong>Dirección:</strong> {profile.address}</p>
                        <p><strong>Teléfono:</strong> {profile.phone}</p>
                        <p><strong>Horario:</strong> {profile.schedule}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <button className="btn primary" onClick={() => setIsEditing(true)}>Editar Perfil</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileAdmin;