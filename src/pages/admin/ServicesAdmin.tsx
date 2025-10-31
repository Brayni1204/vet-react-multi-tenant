// src/pages/admin/ServicesAdmin.tsx (Corregido y con Tailwind CSS)
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../contexts/TenantContext';

interface Service {
    id: number;
    title: string;
    description: string;
    image: string;
    is_active: boolean;
}

interface ServiceForm {
    title: string;
    description: string;
    image: string;
    imageFile: File | null;
}

type FilterStatus = 'all' | 'active' | 'inactive';

// Componentes de Iconos
// Aplicamos estilos base para que Tailwind los pueda usar
const IconEdit = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Editar" {...props}>✏️</span>;
const IconActivate = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Activar" {...props}>✅</span>;
const IconDeactivate = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Desactivar" {...props}>🚫</span>;
const IconAdd = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Agregar" {...props}>➕</span>;
const IconSearch = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Buscar" {...props}>🔍</span>;


const ServicesAdmin: React.FC = () => {
    const { tenantData, loading, error, getApiUrl } = useTenant();
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
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    const token = localStorage.getItem('admin-token');

    // Helper para construir la URL de visualización (GET)
    const getDisplayImageUrl = (path: string) => {
        if (!path || path.startsWith('http')) return path;
        // La URL se construye usando el host actual del navegador para archivos estáticos
        return `http://${window.location.host.split(':')[0]}:4000${path}`;
    };


    const fetchServices = useCallback(async () => {
        if (!tenantData) return;
        if (!token) {
            setFetchError("Error: Token de autenticación no encontrado. Por favor, inicie sesión.");
            return;
        }

        setIsLoading(true);
        setFetchError(null);

        const url = `${getApiUrl()}/services?status=${filterStatus}&search=${searchQuery}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
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
    }, [tenantData, token, getApiUrl, filterStatus, searchQuery]);


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

        if (!tenantData || !token) {
            setFetchError("Error de autenticación o ID de inquilino no disponible.");
            setIsLoading(false);
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${getApiUrl()}/services/${isEditing}`
            : `${getApiUrl()}/services`;

        const formData = new FormData();
        formData.append('title', formState.title);
        formData.append('description', formState.description);

        if (formState.imageFile) {
            formData.append('image', formState.imageFile);
        } else if (method === 'POST' && !formState.image) {
            setFetchError('Debe seleccionar un archivo de imagen.');
            setIsLoading(false);
            return;
        }


        try {
            const response = await fetch(url, {
                method,
                headers: {
                    // No Content-Type aquí para FormData, el navegador lo hace automáticamente
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

    const handleToggleActive = async (serviceId: number, currentStatus: boolean) => {
        const newState = !currentStatus;
        const action = newState ? 'activar' : 'desactivar';
        const endpoint = newState ? 'activate' : 'deactivate';
        const confirmMessage = `¿Estás seguro de que quieres ${action} este servicio?`;

        if (!window.confirm(confirmMessage)) return;

        if (!tenantData || !token) return;
        setFetchError(null);

        const url = `${getApiUrl()}/services/${serviceId}/${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
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
            image: service.image,
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

    if (loading) return <div className="p-6 text-gray-700">Cargando datos de la clínica...</div>;
    if (error || !tenantData) return <div className="p-6 text-red-600 font-semibold">{error || "No se pudo cargar la información de la clínica."}</div>;


    // Componente Modal (con clases Tailwind)
    const ModalForm = isModalOpen ? (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50 transition-opacity duration-300"
            onClick={handleCancel}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative border-t-4 border-indigo-600 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
                translate="no" // 👈 Evita la traducción automática en el modal
            >
                <h3 className="text-2xl font-extrabold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                    {isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
                </h3>
                {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200">{fetchError}</div>}

                <form onSubmit={handleFormSubmit} className='space-y-4'>

                    <div className="form-group">
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                        <input type="text" name="title" id="title" value={formState.title} onChange={handleFormChange} required
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <textarea name="description" id="description" value={formState.description} onChange={handleFormChange} required
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 h-24 resize-none"
                        />
                    </div>

                    <div className="form-group space-y-3">
                        <label htmlFor="imageFile" className="block text-sm font-semibold text-gray-700 mb-1">
                            Subir Imagen
                            {(isEditing && formState.image) ? ` (Actual: ${formState.image.substring(formState.image.lastIndexOf('/') + 1)})` : ''}
                        </label>
                        <input type="file" name="imageFile" id="imageFile" onChange={handleFileChange} accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />

                        {/* Previsualización y botón Quitar */}
                        {(formState.image || formState.imageFile) && (
                            <div className="flex flex-col items-start space-y-3 pt-2">
                                <img
                                    src={formState.imageFile ? URL.createObjectURL(formState.imageFile) : getDisplayImageUrl(formState.image)}
                                    alt="Imagen actual/preview"
                                    className="w-40 h-40 object-cover rounded-lg shadow-md border border-gray-200"
                                />

                                {/* Opción para quitar imagen */}
                                {isEditing && formState.image && (
                                    <button
                                        type="button"
                                        className="text-red-600 hover:text-red-800 text-sm font-medium transition duration-150"
                                        onClick={() => setFormState(p => ({ ...p, image: '', imageFile: null }))}
                                    >
                                        Quitar Imagen Actual
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button"
                            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCancel} disabled={isLoading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;

    const ModalPortal = isModalOpen
        ? createPortal(ModalForm, document.body)
        : null;


    return (
        // 👇 Aplicamos translate="no" al contenedor principal
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" translate="no">
            <div className="bg-white shadow-xl rounded-xl p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-900 mb-8 border-b-4 border-indigo-100 pb-3">
                    Servicios de {tenantData.name}
                </h2>

                {/* Controles: Botón y Filtros */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <button
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                        onClick={handleCreateClick}
                    >
                        <IconAdd className="text-lg" /> <span>Agregar Nuevo Servicio</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex items-center border border-gray-300 rounded-lg p-2 bg-white w-full md:w-64 focus-within:ring-2 focus-within:ring-indigo-500 transition duration-150 shadow-sm">
                            <IconSearch className="text-gray-500 ml-1" />
                            <input
                                type="text"
                                placeholder="Buscar por Título..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="outline-none w-full text-gray-700 px-2"
                            />
                        </div>

                        {/* Status Select */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 w-full md:w-auto appearance-none pr-8"
                        >
                            <option value="all">Mostrar Todos</option>
                            <option value="active">Solo Activos</option>
                            <option value="inactive">Solo Inactivos</option>
                        </select>
                    </div>
                </div>

                {/* Lista de Servicios */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">
                        Servicios Encontrados ({services.length})
                    </h3>
                    {isLoading && <p className="text-gray-500 italic p-4 text-center">Cargando servicios...</p>}
                    {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200">Error: {fetchError}</div>}

                    {services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    // 👈 Eliminamos 'opacity-70' aquí. Solo el color del borde y el hover.
                                    className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border-t-4 ${service.is_active ? 'border-green-500 hover:shadow-xl' : 'border-red-500 hover:shadow-xl'}`}
                                >
                                    {/* 💡 Nuevo contenedor interno: Opcional si quieres un sutil efecto "desactivado" */}
                                    <div className={`${!service.is_active ? 'bg-gray-50' : ''}`}>

                                        {/* Imagen y Status Tag */}
                                        <div className="relative h-48 w-full">
                                            {service.image ? (
                                                <img
                                                    src={getDisplayImageUrl(service.image)}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">No Image</div>
                                            )}
                                            {/* Etiqueta de estado */}
                                            <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full text-white shadow-md ${service.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {service.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>

                                        {/* Información y Acciones */}
                                        <div className="p-4 space-y-3">
                                            <h4 className="text-xl font-bold text-gray-800 line-clamp-2">{service.title}</h4>
                                            <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>

                                            <div className="flex flex-wrap gap-2 pt-3">
                                                <button
                                                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition duration-150 shadow-sm"
                                                    onClick={() => handleEditClick(service)}
                                                >
                                                    <IconEdit /> <span>Editar</span>
                                                </button>

                                                {/* Botón de activación/desactivación dinámico */}
                                                <button
                                                    className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition duration-150 ${service.is_active ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
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
                                    </div> {/* Cierre del div interno opcional */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-6 p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
                            No se encontraron servicios con los filtros aplicados.
                        </p>
                    )}
                </div>

                {ModalPortal}
            </div>
        </div>
    );
};

export default ServicesAdmin;