/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/admin/ServicesAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../../contexts/TenantContext'; // Importamos el hook
import '../../styles/admin.css';

interface Service {
    id: number;
    title: string;
    description: string;
    image: string;
}

interface ServiceForm {
    title: string;
    description: string;
    image: string;
}

const ServicesAdmin: React.FC = () => {
    const { tenantData, loading, error } = useTenant();
    const [services, setServices] = useState<Service[]>([]);
    const [formState, setFormState] = useState<ServiceForm>({ title: '', description: '', image: '' });
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const token = localStorage.getItem('admin-token');
    const hostname = window.location.hostname;

    // Función auxiliar para construir la URL base del API
    const getBaseUrl = () => `http://${hostname}:4000/api/tenants/${tenantData?.id}`;

    const fetchServices = useCallback(async () => {
        if (!tenantData?.id) return;
        setIsLoading(true);
        setFetchError(null);

        // 🛠️ FIX: Usar la URL completa del backend
        const url = `${getBaseUrl()}/services`;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                // Mantenemos la estructura de la respuesta para el front
                setServices(data.services || []);
            } else {
                throw new Error(data.message || 'No se pudieron cargar los servicios.');
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cargar servicios.');
        } finally {
            setIsLoading(false);
        }
    }, [tenantData, token, hostname]);

    useEffect(() => {
        if (tenantData) {
            fetchServices();
        }
    }, [tenantData, fetchServices]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFetchError(null);

        if (!tenantData?.id) {
            setFetchError("ID de inquilino no disponible.");
            setIsLoading(false);
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        // 🛠️ FIX: Usar la URL completa del backend
        const url = isEditing
            ? `${getBaseUrl()}/services/${isEditing}`
            : `${getBaseUrl()}/services`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formState)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el servicio.`);
            }

            setFormState({ title: '', description: '', image: '' });
            setIsEditing(null);
            fetchServices(); // Refresca la lista de servicios
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (serviceId: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;

        if (!tenantData?.id) return;

        // 🛠️ FIX: Usar la URL completa del backend
        const url = `${getBaseUrl()}/services/${serviceId}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchServices();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo eliminar el servicio.');
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al eliminar el servicio.');
        }
    };

    const handleEditClick = (service: Service) => {
        setFormState({ title: service.title, description: service.description, image: service.image });
        setIsEditing(service.id);
    };

    if (loading) return <div>Cargando datos de la clínica...</div>;
    if (error || !tenantData) return <div>{error || "No se pudo cargar la información de la clínica."}</div>;

    return (
        <div className="services-admin-page">
            <h2>Servicios de {tenantData.name}</h2>

            <div className="services-admin-form-container">
                <h3>{isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}</h3>
                {fetchError && <div className="error-message">{fetchError}</div>}
                <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Título</label>
                        <input type="text" name="title" value={formState.title} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Descripción</label>
                        <textarea name="description" value={formState.description} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">URL de la Imagen</label>
                        <input type="text" name="image" value={formState.image} onChange={handleFormChange} required />
                    </div>
                    <div className="admin-actions">
                        <button type="submit" className="btn primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
                        {isEditing && (
                            <button type="button" className="btn secondary" onClick={() => { setIsEditing(null); setFormState({ title: '', description: '', image: '' }); }} disabled={isLoading}>Cancelar</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="services-list">
                <h3>Servicios actuales</h3>
                {services.length > 0 ? (
                    services.map(service => (
                        <div key={service.id} className="service-admin-item">
                            <img src={service.image} alt={service.title} />
                            <div className="service-admin-info">
                                <h4>{service.title}</h4>
                                <p>{service.description}</p>
                            </div>
                            <div className="service-admin-actions">
                                <button className="btn secondary small" onClick={() => handleEditClick(service)}>Editar</button>
                                <button className="btn danger small" onClick={() => handleDelete(service.id)}>Eliminar</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay servicios creados para esta clínica.</p>
                )}
            </div>
        </div>
    );
};

export default ServicesAdmin;