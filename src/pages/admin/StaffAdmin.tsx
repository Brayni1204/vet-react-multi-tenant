/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
// src/pages/admin/StaffAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../contexts/TenantContext';

// 1. COMPONENTES DE ICONOS (Mantenemos los iconos)
interface IconProps extends React.ComponentPropsWithoutRef<'span'> { }

const IconEdit: React.FC<IconProps> = (props) => <span role="img" aria-label="Editar" {...props}>✏️</span>;
const IconAdd: React.FC<IconProps> = (props) => <span role="img" aria-label="Agregar" {...props}>➕</span>;
const IconSearch: React.FC<IconProps> = (props) => <span role="img" aria-label="Buscar" {...props}>🔍</span>;
const IconRole: React.FC<IconProps> = (props) => <span role="img" aria-label="Rol" {...props}>🧑‍💼</span>;


// 2. INTERFACES Y LÓGICA (Mantenemos las interfaces)
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
    // 🔑 USAMOS getApiUrl del contexto para construir URLs
    const { tenantData, loading: tenantLoading, error: tenantError, getApiUrl } = useTenant();
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

    const fetchStaff = useCallback(async () => {
        if (!tenantData) return;

        if (!token) {
            setFetchError("Error: Token de autenticación no encontrado. Por favor, inicie sesión.");
            return;
        }

        setIsLoading(true);
        setFetchError(null);

        // 🎯 RUTA: Endpoint simplificado /staff
        const url = `${getApiUrl()}/staff`;

        const query = new URLSearchParams();
        if (filterRole !== 'all') {
            query.append('role', filterRole);
        }
        if (searchQuery) {
            query.append('search', searchQuery);
        }
        const fullUrl = `${url}?${query.toString()}`;

        try {
            const response = await fetch(fullUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'No se pudo cargar la lista de personal.');
            }

            setStaffList(data.users || []);

        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cargar personal.');
        } finally {
            setIsLoading(false);
        }
    }, [tenantData, token, getApiUrl, filterRole, searchQuery]);

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

        if (!tenantData || !token) {
            setFetchError("Error de autenticación o ID de inquilino no disponible.");
            setIsLoading(false);
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';

        const url = isEditing
            ? `${getApiUrl()}/staff/${isEditing}`
            : `${getApiUrl()}/staff`;

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
        // Solo incluimos la contraseña si se proporciona
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

    if (tenantLoading) return <div className="p-6 text-gray-700">Cargando datos de la clínica...</div>;
    if (tenantError || !tenantData) return <div className="p-6 text-red-600 font-semibold">{tenantError || "No se pudo cargar la información de la clínica."}</div>;

    // Helper para asignar color de rol
    const getRoleTagClasses = (role: Staff['role']) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 ring-red-500/10';
            case 'doctor': return 'bg-green-100 text-green-800 ring-green-500/10';
            case 'receptionist': return 'bg-yellow-100 text-yellow-800 ring-yellow-500/10';
            default: return 'bg-gray-100 text-gray-800 ring-gray-500/10';
        }
    };

    // Componente Modal (con clases Tailwind)
    const ModalForm = isModalOpen ? (
        // Fondo oscuro y centrado
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50 transition-opacity duration-300"
            onClick={handleCancel} // Cierra al hacer clic fuera
        >
            {/* Contenedor del Modal */}
            <div
                className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative border-t-4 border-blue-600 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro
                // 👇 Aplica translate="no" al modal completo
                translate="no"
            >
                <h3 className="text-2xl font-extrabold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                    {isEditing ? 'Editar Personal' : 'Agregar Nuevo Personal'}
                </h3>
                {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200">{fetchError}</div>}

                <form onSubmit={handleFormSubmit} className='space-y-4'>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formState.email}
                            onChange={handleFormChange}
                            required
                            disabled={!!isEditing}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-100"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Contraseña {isEditing ? '(dejar en blanco para no cambiar)' : ''}
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formState.password || ''}
                            onChange={handleFormChange}
                            required={!isEditing}
                            placeholder={isEditing ? '••••••••' : ''}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formState.name}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                        <div className="relative">
                            <select
                                name="role"
                                id="role"
                                value={formState.role}
                                onChange={handleFormChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none pr-10"
                            >
                                <option value="receptionist">Recepcionista</option>
                                <option value="doctor">Doctor</option>
                                <option value="admin">Administrador</option>
                            </select>
                            {/* Icono para el select */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            type="button"
                            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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

    const ModalPortal = isModalOpen
        ? createPortal(ModalForm, document.body)
        : null;


    return (
        // 👇 Aplica translate="no" al contenedor principal para mayor seguridad
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen" translate="no">
            <div className="bg-white shadow-xl rounded-xl p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-8 border-b-4 border-blue-100 pb-3">
                    Personal de {tenantData.name}
                </h2>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <button
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                        onClick={handleCreateClick}
                    >
                        <IconAdd className="text-lg" /> <span>Agregar Nuevo Personal</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative flex items-center border border-gray-300 rounded-lg p-2 bg-white w-full md:w-72 focus-within:ring-2 focus-within:ring-blue-500 transition duration-150 shadow-sm">
                            <IconSearch className="text-gray-500 ml-1" />
                            <input
                                type="text"
                                placeholder="Buscar por Nombre o Email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="outline-none w-full text-gray-700 px-2"
                            />
                        </div>

                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as FilterRole)}
                            className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 w-full md:w-auto appearance-none pr-8"
                        >
                            <option value="all">Todos los Roles</option>
                            <option value="admin">Administradores</option>
                            <option value="doctor">Doctores</option>
                            <option value="receptionist">Recepcionistas</option>
                        </select>
                    </div>

                </div>

                {/* --- */}

                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">
                        Personal Encontrado ({staffList.length})
                    </h3>
                    {isLoading && <p className="text-gray-500 italic p-4 text-center">Cargando personal...</p>}
                    {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200">Error: {fetchError}</div>}

                    {staffList.length > 0 ? (
                        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Admin</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {staffList.map(staff => (
                                        <tr key={staff.id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getRoleTagClasses(staff.role)}`}
                                                >
                                                    <IconRole className="mr-1 text-base" /> {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.is_admin ? '✅ Sí' : '❌ No'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                                <div className="flex space-x-2 justify-end">
                                                    <button
                                                        // 👇 Mantenemos translate="no" aquí también
                                                        translate="no"
                                                        className="flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-md bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition duration-150 shadow-sm"
                                                        onClick={() => handleEditClick(staff)}
                                                    >
                                                        <IconEdit /> <span></span>
                                                    </button>
                                                    {/* <button
                                                        // 👇 Mantenemos translate="no" aquí
                                                        translate="no"
                                                        className="flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                                        disabled={staff.id === 1} // Asumiendo que el ID 1 es el Super Admin inicial
                                                    >
                                                        <IconDelete /> <span>Eliminar</span>
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-6 p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
                            No se encontró personal con los filtros aplicados.
                        </p>
                    )}
                </div>

                {ModalPortal}
            </div>
        </div>
    );
};

export default StaffAdmin;