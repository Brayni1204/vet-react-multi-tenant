// src/pages/admin/ProfileAdmin.tsx
import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';

interface ClinicProfile {
    name: string;
    address: string;
    phone: string;
    schedule: string;
    email: string;
}

const ProfileAdmin: React.FC = () => {
    const { tenantData, loading, error, getApiUrl } = useTenant();
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

        const tenantSlug = tenantData?.tenantId;

        if (!tenantSlug || !token) {
            setFetchError("Error: El slug de inquilino o el token no están disponibles. Intente iniciar sesión nuevamente.");
            setIsLoading(false);
            return;
        }

        const targetUrl = `${getApiUrl()}/tenants/${tenantSlug}`;

        try {
            const response = await fetch(targetUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profile.name,
                    contact: {
                        address: profile.address,
                        phone: profile.phone,
                        schedule: profile.schedule,
                        email: profile.email,
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo actualizar el perfil.');
            }

            console.log("Perfil actualizado con éxito!");
            setIsEditing(false);
            window.location.reload();
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al guardar.');
        } finally {
            setIsLoading(false);
        }
    };

    // NOTA: Asegúrate de que tu `handleSave` envíe el formato correcto de `tenantData` al backend.
    // He ajustado el `body` del fetch para incluir `contact` anidado, asumiendo que el API espera ese formato.

    if (loading) return <div className="p-6 text-gray-700">Cargando datos de la clínica...</div>;
    if (error || !tenantData) return <div className="p-6 text-red-600 font-semibold">{error || "No se pudo cargar la información de la clínica."}</div>;

    return (
        <div className="profile-admin-page p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mi Clínica</h1>
            <div className="profile-card bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto">
                {isEditing ? (
                    <form onSubmit={handleSave} className="profile-edit-form space-y-6">
                        {/* Grupo de formulario para Nombre */}
                        <div className="form-group">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clínica</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={profile.name}
                                onChange={handleEditChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                        </div>
                        {/* Grupo de formulario para Dirección */}
                        <div className="form-group">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                value={profile.address}
                                onChange={handleEditChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                        </div>
                        {/* Grupo de formulario para Teléfono */}
                        <div className="form-group">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                value={profile.phone}
                                onChange={handleEditChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                        </div>
                        {/* Grupo de formulario para Horario */}
                        <div className="form-group">
                            <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                            <input
                                type="text"
                                name="schedule"
                                id="schedule"
                                value={profile.schedule}
                                onChange={handleEditChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                        </div>
                        {/* Grupo de formulario para Email */}
                        <div className="form-group">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={profile.email}
                                onChange={handleEditChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                        </div>

                        {fetchError && <div className="error-message p-3 text-red-700 bg-red-100 border border-red-200 rounded-lg">{fetchError}</div>}

                        <div className="profile-actions flex justify-end space-x-4 pt-4">
                            {/* Botón Guardar */}
                            <button
                                type="submit"
                                translate="no"
                                className="btn primary px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 transition duration-150 ease-in-out font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                            {/* Botón Cancelar */}
                            <button
                                type="button"
                                className="btn secondary px-4 py-2 text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 transition duration-150 ease-in-out font-medium"
                                onClick={() => setIsEditing(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-details space-y-4">
                        <p className="text-lg"><strong className="font-semibold text-gray-700 block">Nombre:</strong> <span className="text-gray-900">{profile.name}</span></p>
                        <p className="text-lg"><strong className="font-semibold text-gray-700 block">Dirección:</strong> <span className="text-gray-900">{profile.address}</span></p>
                        <p className="text-lg"><strong className="font-semibold text-gray-700 block">Teléfono:</strong> <span className="text-gray-900">{profile.phone}</span></p>
                        <p className="text-lg"><strong className="font-semibold text-gray-700 block">Horario:</strong> <span className="text-gray-900">{profile.schedule}</span></p>
                        <p className="text-lg"><strong className="font-semibold text-gray-700 block">Email:</strong> <span className="text-gray-900">{profile.email}</span></p>
                        <button
                            className="btn primary mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out font-bold"
                            onClick={() => setIsEditing(true)}
                        >
                            ✏️ Editar Perfil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileAdmin;