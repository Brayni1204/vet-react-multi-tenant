// src/pages/admin/ServicesAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
// 🆕 Importar createPortal
import { createPortal } from 'react-dom';
import { useTenant } from '../../contexts/TenantContext';
import '../../styles/admin.css';

interface Service {
    id: number;
    title: string;
    description: string;
    image: string; // URL de la imagen (completa desde el backend)
    is_active: boolean; // Estado del servicio
}

interface ServiceForm {
    title: string;
    description: string;
    image: string; // URL actual (para previsualización)
    imageFile: File | null; // Archivo seleccionado para subir
}

type FilterStatus = 'all' | 'active' | 'inactive';

// 🆕 Componentes de Iconos (Simulación de librería de iconos)
const IconEdit = () => <span role="img" aria-label="Editar">✏️</span>;
const IconActivate = () => <span role="img" aria-label="Activar">✅</span>; // Cambié a un ícono más visible
const IconDeactivate = () => <span role="img" aria-label="Desactivar">🚫</span>;
const IconAdd = () => <span role="img" aria-label="Agregar">➕</span>;
const IconSearch = () => <span role="img" aria-label="Buscar">🔍</span>;


const ServicesAdmin: React.FC = () => {
    const { tenantData, loading, error } = useTenant();
    const [services, setServices] = useState<Service[]>([]);

    const [formState, setFormState] = useState<ServiceForm>({
        title: '',
        description: '',
        image: '',
        imageFile: null
    });
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all'); // Cambié default a 'all'

    const token = localStorage.getItem('admin-token');
    const hostname = window.location.hostname;

    // Helper para construir la URL base del API
    const getBaseUrl = useCallback(() => {
        if (!tenantData?.id) return '';
        return `http://${hostname}:4000/api/tenants/${tenantData.id}`;
    }, [tenantData, hostname]);

    // Helper para construir la URL de visualización (GET)
    const getDisplayImageUrl = (path: string) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `http://${hostname}:4000${path}`;
    };


    const fetchServices = useCallback(async () => {
        if (!tenantData?.id) return;
        setIsLoading(true);
        setFetchError(null);

        // Envía filtros como query params
        const url = `${getBaseUrl()}/services?status=${filterStatus}&search=${searchQuery}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setServices(data.services || []);
            } else {
                throw new Error(data.message || 'No se pudieron cargar los servicios.');
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cargar servicios.');
        } finally {
            setIsLoading(false);
        }
    }, [tenantData, token, getBaseUrl, filterStatus, searchQuery]);

    // Efecto para recargar al cambiar filtros
    useEffect(() => {
        if (tenantData) {
            const handler = setTimeout(() => {
                fetchServices();
            }, 300);

            return () => clearTimeout(handler);
        }
    }, [filterStatus, searchQuery, tenantData, fetchServices]);


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFormState(prevState => ({ ...prevState, imageFile: file }));
    };

    const handleCancel = () => {
        setIsEditing(null);
        setIsModalOpen(false);
        setFormState({ title: '', description: '', image: '', imageFile: null });
        setFetchError(null);
    }

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
        const url = isEditing
            ? `${getBaseUrl()}/services/${isEditing}`
            : `${getBaseUrl()}/services`;

        const formData = new FormData();
        formData.append('title', formState.title);
        formData.append('description', formState.description);

        if (formState.imageFile) {
            formData.append('image', formState.imageFile);
        } else if (isEditing) {
            // Si es edición y no se subió un archivo, enviamos la URL/path de la imagen actual
            formData.append('image', formState.image || '');
        } else if (method === 'POST') {
            setFetchError('Debe seleccionar un archivo de imagen.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el servicio.`);
            }

            handleCancel();
            fetchServices();

        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    // 🎯 Función para TOGGLE (Activar/Desactivar)
    const handleToggleActive = async (serviceId: number, currentStatus: boolean) => {
        const newState = !currentStatus;
        const action = newState ? 'activar' : 'desactivar';
        const endpoint = newState ? 'activate' : 'deactivate';
        const confirmMessage = `¿Estás seguro de que quieres ${action} este servicio?`;

        if (!window.confirm(confirmMessage)) return;

        if (!tenantData?.id) return;
        setFetchError(null);

        const url = `${getBaseUrl()}/services/${serviceId}/${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // PUT requires a body, even if empty
            });
            if (response.ok) {
                fetchServices();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `No se pudo ${action} el servicio.`);
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : `Error al ${action} el servicio.`);
        }
    };

    const handleEditClick = (service: Service) => {
        setFormState({
            title: service.title,
            description: service.description,
            image: service.image, // La URL completa viene de la DB
            imageFile: null
        });
        setIsEditing(service.id);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setIsEditing(null);
        setFormState({ title: '', description: '', image: '', imageFile: null });
        setIsModalOpen(true);
    }

    if (loading) return <div>Cargando datos de la clínica...</div>;
    if (error || !tenantData) return <div>{error || "No se pudo cargar la información de la clínica."}</div>;

    // 🆕 Componente Modal fuera del return principal
    const ModalForm = isModalOpen ? (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}</h3>
                {fetchError && <div className="error-message">{fetchError}</div>}
                <form onSubmit={handleFormSubmit}>

                    <div className="form-group">
                        <label htmlFor="title">Título</label>
                        <input type="text" name="title" id="title" value={formState.title} onChange={handleFormChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descripción</label>
                        <textarea name="description" id="description" value={formState.description} onChange={handleFormChange} required />
                    </div>

                    <div className="form-group file-upload-group">
                        <label htmlFor="imageFile">
                            Subir Imagen
                            {(isEditing && formState.image) ? ` (Actual: ${formState.image.substring(formState.image.lastIndexOf('/') + 1)})` : ''}
                        </label>
                        <input type="file" name="imageFile" id="imageFile" onChange={handleFileChange} accept="image/*" />

                        {/* Previsualización */}
                        {(formState.image || formState.imageFile) && (
                            <div className="image-preview-wrapper">
                                <img
                                    src={formState.imageFile ? URL.createObjectURL(formState.imageFile) : getDisplayImageUrl(formState.image)}
                                    alt="Imagen actual/preview"
                                />
                            </div>
                        )}

                        {/* Opción para quitar imagen */}
                        {isEditing && formState.image && (
                            <button
                                type="button"
                                className="btn danger small delete-image-btn"
                                onClick={() => setFormState(p => ({ ...p, image: '', imageFile: null }))}
                            >
                                Quitar Imagen Actual
                            </button>
                        )}
                    </div>

                    <div className="admin-actions modal-actions">
                        <button type="submit" className="btn primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
                        <button type="button" className="btn secondary" onClick={handleCancel} disabled={isLoading}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;

    // 🎯 Renderizamos el modal usando un Portal
    const ModalPortal = isModalOpen
        ? createPortal(ModalForm, document.body)
        : null;


    return (
        <div className="services-admin-page">
            <h2>Servicios de {tenantData.name}</h2>

            <div className="admin-controls">
                <button className="btn primary" onClick={handleCreateClick}>
                    <IconAdd /> Agregar Nuevo Servicio
                </button>

                {/* Controles de Filtrado y Búsqueda */}
                <div className="filter-group">
                    <div className="search-bar"> {/* Clase que usa el estilo del buscador */}
                        <IconSearch />
                        <input
                            type="text"
                            placeholder="Buscar por Título o Descripción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                        className="status-select"
                    >
                        <option value="all">Mostrar Todos</option>
                        <option value="active">Solo Activos</option>
                        <option value="inactive">Solo Inactivos</option>
                    </select>
                </div>

            </div>

            <div className="services-list-container">
                <h3>Servicios Encontrados ({services.length})</h3>
                <div className="services-list">
                    {services.length > 0 ? (
                        services.map(service => (
                            <div key={service.id} className={`service-admin-item card-shadow ${!service.is_active ? 'inactive-card' : ''}`}>
                                <div className="service-image-container">
                                    {service.image ? (
                                        <img src={getDisplayImageUrl(service.image)} alt={service.title} />
                                    ) : (
                                        <div className="no-image-placeholder">No Image</div>
                                    )}
                                    {/* Etiqueta de estado */}
                                    <span className={`status-tag ${service.is_active ? 'active-tag' : 'inactive-tag'}`}>
                                        {service.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                <div className="service-admin-info">
                                    <h4>{service.title}</h4>
                                    <p className="service-description">{service.description}</p>
                                    <div className="service-admin-actions">
                                        <button className="btn secondary small" onClick={() => handleEditClick(service)}>
                                            <IconEdit /> Editar
                                        </button>

                                        {/* Botón de activación/desactivación dinámico */}
                                        <button
                                            className={`btn small ${service.is_active ? 'danger' : 'success'}`}
                                            onClick={() => handleToggleActive(service.id, service.is_active)}
                                        >
                                            {service.is_active ? (
                                                <> <IconDeactivate /> Desactivar </>
                                            ) : (
                                                <> <IconActivate /> Activar </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">No se encontraron servicios con los filtros aplicados.</p>
                    )}
                </div>
            </div>

            {ModalPortal} {/* 🎯 Renderiza el Portal aquí */}
        </div>
    );
};

export default ServicesAdmin;