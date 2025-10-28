/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/StaffAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../contexts/TenantContext';

// 1. INTERFACES DEL COMPONENTE DE ICONOS (Solución del error)
// Usamos React.ComponentPropsWithoutRef<'span'> para heredar todas las props de un <span>,
// incluyendo 'className', 'role', etc.
interface IconProps extends React.ComponentPropsWithoutRef<'span'> { }

// 2. COMPONENTES DE ICONOS (Corregidos para aceptar 'className')
const IconEdit: React.FC<IconProps> = (props) => <span role="img" aria-label="Editar" {...props}>✏️</span>;
const IconDelete: React.FC<IconProps> = (props) => <span role="img" aria-label="Eliminar" {...props}>🗑️</span>;
const IconAdd: React.FC<IconProps> = (props) => <span role="img" aria-label="Agregar" {...props}>➕</span>;
const IconSearch: React.FC<IconProps> = (props) => <span role="img" aria-label="Buscar" {...props}>🔍</span>;
const IconRole: React.FC<IconProps> = (props) => <span role="img" aria-label="Rol" {...props}>🧑‍💼</span>;


// 3. RESTO DE INTERFACES Y LÓGICA (Sin cambios)
interface Staff {
    id: number;
    tenant_id: string;
    email: string;
    name: string;
    is_admin: boolean;
    role: 'admin' | 'doctor' | 'receptionist';
}

interface StaffForm {
    email: string;
    password?: string;
    name: string;
    role: 'admin' | 'doctor' | 'receptionist';
}

type FilterRole = 'all' | 'admin' | 'doctor' | 'receptionist';

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

    const getBaseUrl = useCallback(() => {
        if (!tenantData?.id) return '';
        return `http://${hostname}:4000/api/tenants/${tenantData.id}`;
    }, [tenantData, hostname]);

    const fetchStaff = useCallback(async () => {
        if (!tenantData?.id) return;
        setIsLoading(true);
        setFetchError(null);
        const url = `${getBaseUrl()}/staff`;
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                let filteredStaff = data.users || [];
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
                throw new Error(data.message || 'No se pudo cargar la lista de personal.');
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cargar personal.');
        } finally {
            setIsLoading(false);
        }
    }, [tenantData, token, getBaseUrl, filterRole, searchQuery]);

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
            ? `${getBaseUrl()}/staff/${isEditing}`
            : `${getBaseUrl()}/staff`;

        if (method === 'POST' && !formState.password) {
            setFetchError('La contraseña es obligatoria para el nuevo personal.');
            setIsLoading(false);
            return;
        }

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
            password: '',
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

    // Helper para asignar color de rol
    const getRoleTagClasses = (role: Staff['role']) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'doctor': return 'bg-green-100 text-green-800';
            case 'receptionist': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // 🆕 Componente Modal (con clases Tailwind)
    const ModalForm = isModalOpen ? (
        // modal-overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-9999">
            {/* modal-content */}
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative border-t-4 border-blue-900">
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                    {isEditing ? 'Editar Personal' : 'Agregar Nuevo Personal'}
                </h3>
                {/* error-message */}
                {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200">{fetchError}</div>}
                <form onSubmit={handleFormSubmit}>

                    {/* form-group */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formState.email}
                            onChange={handleFormChange}
                            required
                            disabled={!!isEditing} // Solo se permite cambiar el email al crear
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-100"
                        />
                    </div>

                    {/* form-group */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña {isEditing ? '(dejar en blanco para no cambiar)' : ''}
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formState.password || ''}
                            onChange={handleFormChange}
                            required={!isEditing} // Requerido solo para creación
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    {/* form-group */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formState.name}
                            onChange={handleFormChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    {/* form-group */}
                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            name="role"
                            id="role"
                            value={formState.role}
                            onChange={handleFormChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none bg-white pr-8"
                        >
                            <option value="receptionist">Recepcionista</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {/* admin-actions modal-actions */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition duration-150 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150 disabled:opacity-50"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
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
        // 🎯 Contenedor Principal (ajusta padding)
        <div className="p-6 md:p-8 bg-white shadow-xl rounded-xl max-w-full lg:max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 border-b-2 border-teal-400 pb-2">
                Personal de {tenantData.name}
            </h2>

            {/* 🎯 Controles: Apilado en móvil (flex-col), en línea en desktop (md:flex-row) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <button
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition duration-150"
                    onClick={handleCreateClick}
                >
                    <IconAdd /> <span>Agregar Nuevo Personal</span>
                </button>

                {/* 🎯 Grupo de Filtros: Permite envolver en móvil (flex-wrap) */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Search Bar: Toma el ancho completo en móvil (w-full), fijo en desktop (md:w-64) */}
                    <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-2 bg-white w-full md:w-64 focus-within:ring-2 focus-within:ring-blue-500 transition duration-150">
                        {/* 🔑 SOLUCIÓN: El IconSearch ahora acepta la prop className */}
                        <IconSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por Nombre o Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="outline-none w-full text-gray-700"
                        />
                    </div>

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as FilterRole)}
                        className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 w-full md:w-auto"
                    >
                        <option value="all">Todos los Roles</option>
                        <option value="admin">Administradores</option>
                        <option value="doctor">Doctores</option>
                        <option value="receptionist">Recepcionistas</option>
                    </select>
                </div>

            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Personal Encontrado ({staffList.length})
                </h3>
                {isLoading && <p className="text-gray-500 italic p-4">Cargando personal...</p>}
                {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200">Error: {fetchError}</div>}

                {staffList.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-blue-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Admin</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-blue-900 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map(staff => (
                                    <tr key={staff.id} className="border-b hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {/* role-tag */}
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getRoleTagClasses(staff.role)}`}>
                                                <IconRole className="mr-1" /> {staff.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.is_admin ? 'Sí' : 'No'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                            {/* Acciones: Botones se mantienen juntos y alineados a la derecha */}
                                            <div className="flex space-x-2 justify-end">
                                                <button
                                                    className="flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-150"
                                                    onClick={() => handleEditClick(staff)}
                                                >
                                                    <IconEdit /> <span></span>
                                                </button>
                                                <button
                                                    className="flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition duration-150 disabled:opacity-50"
                                                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                                    disabled={staff.id === 1} // Simulación de prevención de auto-eliminación
                                                >
                                                    <IconDelete /> <span></span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {staffList.length === 0 && !isLoading && !fetchError && (
                    <p className="text-gray-500 mt-4 p-4 border border-dashed border-gray-300 rounded-lg text-center">
                        No se encontró personal con los filtros aplicados.
                    </p>
                )}
            </div>

            {ModalPortal}
        </div>
    );
};

export default StaffAdmin;