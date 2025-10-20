// src/pages/admin/ProfileAdmin.tsx
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext'; // Importamos el hook
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
    const { tenantData, loading, error } = useTenant();
    const [profile, setProfile] = useState<ClinicProfile>({
        name: '',
        address: '',
        phone: '',
        schedule: '',
        email: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const token = localStorage.getItem('admin-token');

    useEffect(() => {
        if (tenantData) {
            setProfile({
                name: tenantData.name,
                address: tenantData.contact.address,
                phone: tenantData.contact.phone,
                schedule: tenantData.contact.schedule,
                email: tenantData.contact.email,
            });
        }
    }, [tenantData]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFetchError(null);

        if (!tenantData?.id) {
            setFetchError("ID de inquilino no disponible.");
            setIsLoading(false);
            return;
        }

        const hostname = window.location.hostname;
        const targetUrl = `http://${hostname}:4000/api/tenants/${tenantData.id}`; // FIX: Usar la URL completa del backend (Puerto 4000)

        try {
            const response = await fetch(targetUrl, { // Usamos la URL completa
                method: 'PUT', // Usamos PUT para actualizar
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // En una app real, usarías el token
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo actualizar el perfil.');
            }

            // Si se guarda correctamente, actualizamos los datos locales (opcional, el TenantProvider ya lo hará)
            console.log("Perfil actualizado con éxito!");
            setIsEditing(false);
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al guardar.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <div>Cargando datos de la clínica...</div>;
    if (error || !tenantData) return <div>{error || "No se pudo cargar la información de la clínica."}</div>;

    return (
        <div className="profile-admin-page">
            <h2>Mi Clínica</h2>
            <div className="profile-card">
                {isEditing ? (
                    <form onSubmit={handleSave} className="profile-edit-form">
                        <div className="form-group">
                            <label htmlFor="name">Nombre de la Clínica</label>
                            <input type="text" name="name" value={profile.name} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Dirección</label>
                            <input type="text" name="address" value={profile.address} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Teléfono</label>
                            <input type="text" name="phone" value={profile.phone} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="schedule">Horario</label>
                            <input type="text" name="schedule" value={profile.schedule} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input type="email" name="email" value={profile.email} onChange={handleEditChange} required />
                        </div>
                        {fetchError && <div className="error-message">{fetchError}</div>}
                        <div className="profile-actions">
                            <button type="submit" className="btn primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
                            <button type="button" className="btn secondary" onClick={() => setIsEditing(false)} disabled={isLoading}>Cancelar</button>
                        </div>
                    </form>
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