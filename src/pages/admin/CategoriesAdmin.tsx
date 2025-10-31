/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/admin/CategoriesAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../contexts/TenantContext';

// --- Interfaces ---
interface Category {
    id: number;
    name: string;
    sort_order: number;
    is_active: boolean;
}

interface CategoryForm {
    name: string;
    sort_order: number;
}

// --- Iconos ---
const IconEdit = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Editar" {...props}>✏️</span>;
const IconActivate = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Activar" {...props}>✅</span>;
const IconDeactivate = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Desactivar" {...props}>🚫</span>;
const IconAdd = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Agregar" {...props}>➕</span>;

const CategoriesAdmin: React.FC = () => {
    const { getApiUrl } = useTenant();
    const [categories, setCategories] = useState<Category[]>([]);
    const [formState, setFormState] = useState<CategoryForm>({ name: '', sort_order: 0 });

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const token = localStorage.getItem('admin-token');

    const getApiEndpoint = (path: string = '') => `${getApiUrl()}/admin/categories${path}`;

    const fetchCategories = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setFetchError(null);

        try {
            const response = await fetch(getApiEndpoint(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setCategories(data.categories || []);
            } else {
                throw new Error(data.message || 'No se pudieron cargar las categorías.');
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cargar.');
        } finally {
            setIsLoading(false);
        }
    }, [getApiUrl, token]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCancel = () => {
        setIsEditing(null);
        setIsModalOpen(false);
        setFormState({ name: '', sort_order: 0 });
        setFetchError(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFetchError(null);

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? getApiEndpoint(`/${isEditing}`) : getApiEndpoint();

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formState)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo guardar.');
            }
            handleCancel();
            fetchCategories();
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        const action = currentStatus ? 'desactivar' : 'activar';
        const endpoint = currentStatus ? 'deactivate' : 'activate';

        if (!window.confirm(`¿Seguro que quieres ${action} esta categoría?`)) return;

        setFetchError(null);
        const url = getApiEndpoint(`/${id}/${endpoint}`);

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchCategories();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `No se pudo ${action}.`);
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cambiar estado.');
        }
    };

    const handleEditClick = (category: Category) => {
        setFormState({ name: category.name, sort_order: category.sort_order });
        setIsEditing(category.id);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setIsEditing(null);
        setFormState({ name: '', sort_order: 0 });
        setIsModalOpen(true);
    };

    // --- Modal ---
    const ModalForm = isModalOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50" onClick={handleCancel}>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()} translate="no">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {isEditing ? 'Editar Categoría' : 'Agregar Categoría'}
                </h3>
                {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{fetchError}</div>}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                        <input type="text" name="name" id="name" value={formState.name}
                            onChange={(e) => setFormState(p => ({ ...p, name: e.target.value }))} required
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="sort_order" className="block text-sm font-semibold text-gray-700 mb-1">Orden (0 primero)</label>
                        <input type="number" name="sort_order" id="sort_order" value={formState.sort_order}
                            onChange={(e) => setFormState(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} required
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50">
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" onClick={handleCancel} disabled={isLoading} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 disabled:opacity-50">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;

    const ModalPortal = isModalOpen ? createPortal(ModalForm, document.body) : null;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" translate="no">
            <div className="bg-white shadow-xl rounded-xl p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-900 mb-8">
                    Administrar Categorías
                </h2>

                <div className="mb-8">
                    <button
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
                        onClick={handleCreateClick}
                    >
                        <IconAdd /> <span>Agregar Categoría</span>
                    </button>
                </div>

                {isLoading && <p>Cargando categorías...</p>}
                {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">Error: {fetchError}</div>}

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">Nombre</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">Orden</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">Estado</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.map(cat => (
                                <tr key={cat.id} className={!cat.is_active ? 'bg-gray-50 opacity-70' : ''}>
                                    <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                                    <td className="p-4 text-gray-700">{cat.sort_order}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${cat.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {cat.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex flex-wrap gap-2">
                                        <button
                                            className="flex items-center space-x-1 px-3 py-1 text-sm rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                            onClick={() => handleEditClick(cat)}
                                        >
                                            <IconEdit /> <span>Editar</span>
                                        </button>
                                        <button
                                            className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg text-white ${cat.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                            onClick={() => handleToggleActive(cat.id, cat.is_active)}
                                        >
                                            {cat.is_active ? <><IconDeactivate /><span>Desactivar</span></> : <><IconActivate /><span>Activar</span></>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {ModalPortal}
            </div>
        </div>
    );
};

export default CategoriesAdmin;