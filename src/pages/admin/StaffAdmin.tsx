/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/StaffAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../contexts/TenantContext';
// Asegúrate de que el archivo CSS exista y esté importado
import '../../styles/admin.css';

// 1. INTERFACES (Adaptadas para el personal/staff)
interface Staff {
    id: number;
    tenant_id: string; // Slug del inquilino
    email: string;
    name: string;
    is_admin: boolean;
    role: 'admin' | 'doctor' | 'receptionist';
}

interface StaffForm {
    email: string;
    password?: string; // Opcional en edición, Requerido en creación
    name: string;
    role: 'admin' | 'doctor' | 'receptionist';
}

type FilterRole = 'all' | 'admin' | 'doctor' | 'receptionist';


// Componentes de Iconos (Simulación de librería de iconos)
const IconEdit = () => <span role="img" aria-label="Editar">✏️</span>;
const IconDelete = () => <span role="img" aria-label="Eliminar">🗑️</span>;
const IconAdd = () => <span role="img" aria-label="Agregar">➕</span>;
const IconSearch = () => <span role="img" aria-label="Buscar">🔍</span>;
const IconRole = () => <span role="img" aria-label="Rol">🧑‍💼</span>;


const StaffAdmin: React.FC = () => {
    const { tenantData, loading: tenantLoading, error: tenantError } = useTenant();
    const [staffList, setStaffList] = useState<Staff[]>([]);

    const [formState, setFormState] = useState<StaffForm>({
        email: '',
        password: '',
        name: '',
        role: 'receptionist'
    });
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<FilterRole>('all');

    const token = localStorage.getItem('admin-token');
    const hostname = window.location.hostname;

    // Helper para construir la URL base del API (usando tenantData.id, que es el SLUG)
    const getBaseUrl = useCallback(() => {
        if (!tenantData?.id) return '';
        // ⚠️ IMPORTANTE: Aquí se pasa el SLUG (e.g., 'chavez') que el backend espera.
        return `http://${hostname}:4000/api/tenants/${tenantData.id}`;
    }, [tenantData, hostname]);


    // 🎯 1. FETCH para obtener la lista de personal
    const fetchStaff = useCallback(async () => {
        if (!tenantData?.id) return;
        setIsLoading(true);
        setFetchError(null);

        // Se usa el slug en la URL, tal como ServicesAdmin.tsx hace:
        const url = `${getBaseUrl()}/staff`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                let filteredStaff = data.users || [];

                // Aplicar filtros de frontend (ya que el backend no los soporta aún)
                if (filterRole !== 'all') {
                    filteredStaff = filteredStaff.filter((s: Staff) => s.role === filterRole);
                }
                if (searchQuery) {
                    const searchLower = searchQuery.toLowerCase();
                    filteredStaff = filteredStaff.filter((s: Staff) =>
                        s.name.toLowerCase().includes(searchLower) ||
                        s.email.toLowerCase().includes(searchLower)
                    );
                }

                setStaffList(filteredStaff);

            } else {
                // Manejar error 404, 401, etc.
                throw new Error(data.message || 'No se pudo cargar la lista de personal.');
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cargar personal.');
        } finally {
            setIsLoading(false);
        }
    }, [tenantData, token, getBaseUrl, filterRole, searchQuery]); // Dependencias para re-fetch

    // Efecto para recargar al cambiar filtros
    useEffect(() => {
        if (tenantData) {
            const handler = setTimeout(() => {
                fetchStaff();
            }, 300);

            return () => clearTimeout(handler);
        }
    }, [filterRole, searchQuery, tenantData, fetchStaff]);


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCancel = () => {
        setIsEditing(null);
        setIsModalOpen(false);
        setFormState({ email: '', password: '', name: '', role: 'receptionist' });
        setFetchError(null);
    }

    // 🎯 2. CREAR o EDITAR Personal (POST / PUT)
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
        // Asumiendo una ruta PUT para edición: /staff/:staffId
        const url = isEditing
            ? `${getBaseUrl()}/staff/${isEditing}`
            : `${getBaseUrl()}/staff`;

        if (method === 'POST' && !formState.password) {
            setFetchError('La contraseña es obligatoria para el nuevo personal.');
            setIsLoading(false);
            return;
        }

        // Simulación: Si es edición y no se cambia la contraseña, no la enviamos.
        const body: any = {
            email: formState.email,
            name: formState.name,
            role: formState.role,
        };
        if (formState.password) {
            body.password = formState.password;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el personal.`);
            }

            handleCancel();
            fetchStaff();

        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    // 🎯 3. ELIMINAR Personal (DELETE /staff/:staffId)
    const handleDeleteStaff = async (staffId: number, name: string) => {
        const confirmMessage = `¿Estás seguro de que quieres eliminar al personal: ${name}?`;

        if (!window.confirm(confirmMessage)) return;

        if (!tenantData?.id) return;
        setFetchError(null);

        const url = `${getBaseUrl()}/staff/${staffId}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.ok) {
                fetchStaff();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `No se pudo eliminar el personal.`);
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : `Error al eliminar el personal.`);
        }
    };

    const handleEditClick = (staff: Staff) => {
        setFormState({
            email: staff.email,
            password: '', // Dejar en blanco para que el usuario no cambie si no quiere
            name: staff.name,
            role: staff.role
        });
        setIsEditing(staff.id);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setIsEditing(null);
        setFormState({ email: '', password: '', name: '', role: 'receptionist' });
        setIsModalOpen(true);
    }

    if (tenantLoading) return <div>Cargando datos de la clínica...</div>;
    if (tenantError || !tenantData) return <div>{tenantError || "No se pudo cargar la información de la clínica."}</div>;

    // 🆕 Componente Modal
    const ModalForm = isModalOpen ? (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isEditing ? 'Editar Personal' : 'Agregar Nuevo Personal'}</h3>
                {fetchError && <div className="error-message">{fetchError}</div>}
                <form onSubmit={handleFormSubmit}>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formState.email}
                            onChange={handleFormChange}
                            required
                            // Solo se permite cambiar el email al crear
                            disabled={!!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña {isEditing ? '(dejar en blanco para no cambiar)' : ''}</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formState.password || ''} // Mostrar vacío para edición
                            onChange={handleFormChange}
                            required={!isEditing} // Requerido solo para creación
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" name="name" id="name" value={formState.name} onChange={handleFormChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Rol</label>
                        <select name="role" id="role" value={formState.role} onChange={handleFormChange} required className="role-select">
                            <option value="receptionist">Recepcionista</option>
                            <option value="doctor">Doctor</option>
                            {/* Opcional: Permitir solo a los super admins crear otros admins */}
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className="admin-actions modal-actions">
                        <button type="submit" className="btn primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
                        <button type="button" className="btn secondary" onClick={handleCancel} disabled={isLoading}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;

    // Renderizamos el modal usando un Portal
    const ModalPortal = isModalOpen
        ? createPortal(ModalForm, document.body)
        : null;


    return (
        <div className="staff-admin-page">
            <h2>Personal de {tenantData.name}</h2>

            <div className="admin-controls">
                <button className="btn primary" onClick={handleCreateClick}>
                    <IconAdd /> Agregar Nuevo Personal
                </button>

                {/* Controles de Filtrado y Búsqueda */}
                <div className="filter-group">
                    <div className="search-bar">
                        <IconSearch />
                        <input
                            type="text"
                            placeholder="Buscar por Nombre o Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as FilterRole)}
                        className="role-select"
                    >
                        <option value="all">Todos los Roles</option>
                        <option value="admin">Administradores</option>
                        <option value="doctor">Doctores</option>
                        <option value="receptionist">Recepcionistas</option>
                    </select>
                </div>

            </div>

            <div className="staff-list-container">
                <h3>Personal Encontrado ({staffList.length})</h3>
                {isLoading && <p>Cargando personal...</p>}
                {fetchError && <div className="error-message">Error: {fetchError}</div>}

                {staffList.length > 0 && (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Admin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(staff => (
                                <tr key={staff.id}>
                                    <td>{staff.id}</td>
                                    <td>{staff.name}</td>
                                    <td>{staff.email}</td>
                                    <td>
                                        <span className={`role-tag ${staff.role}-tag`}>
                                            <IconRole /> {staff.role}
                                        </span>
                                    </td>
                                    <td>{staff.is_admin ? 'Sí' : 'No'}</td>
                                    <td className="actions-cell">
                                        <button className="btn secondary small" onClick={() => handleEditClick(staff)}>
                                            <IconEdit /> Editar
                                        </button>
                                        <button
                                            className="btn danger small"
                                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                            // Simulación de prevención de auto-eliminación
                                            disabled={staff.id === 1}
                                        >
                                            <IconDelete /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {staffList.length === 0 && !isLoading && !fetchError && (
                    <p className="empty-message">No se encontró personal con los filtros aplicados.</p>
                )}
            </div>

            {ModalPortal}
        </div>
    );
};

export default StaffAdmin;