/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/admin/ProductsAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../contexts/TenantContext';

// --- Interfaces ---
interface Category {
    [x: string]: any;
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string | null;
    is_available: boolean;
    category_id: number;
    category_name: string;
}

interface ProductForm {
    name: string;
    description: string;
    price: string; // Usar string para el input
    stock: string; // Usar string para el input
    category_id: string; // Usar string para el select
    imageFile: File | null;
    imagePreview: string | null; // Para la URL de la imagen existente o nueva
}

type FilterStatus = 'all' | 'available' | 'unavailable';

// --- Iconos ---
const IconEdit = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Editar" {...props}>✏️</span>;
const IconActivate = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Activar" {...props}>✅</span>;
const IconDeactivate = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Desactivar" {...props}>🚫</span>;
const IconAdd = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Agregar" {...props}>➕</span>;
const IconSearch = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Buscar" {...props}>🔍</span>;


const ProductsAdmin: React.FC = () => {
    const { tenantData, getApiUrl } = useTenant();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // Para el dropdown

    const initialFormState: ProductForm = {
        name: '', description: '', price: '0.00', stock: '0',
        category_id: '', imageFile: null, imagePreview: null
    };
    const [formState, setFormState] = useState<ProductForm>(initialFormState);

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    const token = localStorage.getItem('admin-token');

    // Helper para construir la URL de visualización (GET)
    const getDisplayImageUrl = (path: string) => {
        if (!path || path.startsWith('http') || path.startsWith('blob:')) return path;
        return `http://${window.location.host.split(':')[0]}:4000${path}`;
    };

    // --- Funciones de Fetch ---

    // Cargar Categorías para el Dropdown
    const fetchCategories = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${getApiUrl()}/admin/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                // Filtramos solo las activas para crear productos
                setCategories((data.categories || []).filter((c: Category) => c.is_active));
            } else {
                setFetchError('Error al cargar categorías para el formulario.');
            }
        } catch (err) {
            setFetchError('Error de red al cargar categorías.');
        }
    }, [getApiUrl, token]);

    // Cargar Productos
    const fetchProducts = useCallback(async () => {
        if (!tenantData || !token) return;
        setIsLoading(true);
        setFetchError(null);

        const url = new URL(`${getApiUrl()}/admin/products`);
        url.searchParams.append('status', filterStatus);
        url.searchParams.append('search', searchQuery);

        try {
            const response = await fetch(url.toString(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products || []);
            } else {
                throw new Error(data.message || 'No se pudieron cargar los productos.');
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Error al cargar productos.');
        } finally {
            setIsLoading(false);
        }
    }, [tenantData, token, getApiUrl, filterStatus, searchQuery]);

    // --- UseEffects ---

    // Cargar categorías al montar
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Cargar productos cuando cambian los filtros
    useEffect(() => {
        if (tenantData) {
            const handler = setTimeout(() => {
                fetchProducts();
            }, 300); // Debounce
            return () => clearTimeout(handler);
        }
    }, [filterStatus, searchQuery, tenantData, fetchProducts]);

    // --- Manejadores de Formulario ---

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFormState(prevState => ({
            ...prevState,
            imageFile: file,
            imagePreview: file ? URL.createObjectURL(file) : prevState.imagePreview // Preview de la nueva imagen
        }));
    };

    const handleCancel = () => {
        setIsEditing(null);
        setIsModalOpen(false);
        setFormState(initialFormState);
        setFetchError(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFetchError(null);

        if (!token || !formState.category_id) {
            setFetchError("Categoría es obligatoria.");
            setIsLoading(false);
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${getApiUrl()}/admin/products/${isEditing}`
            : `${getApiUrl()}/admin/products`;

        const formData = new FormData();
        formData.append('name', formState.name);
        formData.append('description', formState.description);
        formData.append('price', formState.price);
        formData.append('stock', formState.stock);
        formData.append('category_id', formState.category_id);

        if (formState.imageFile) {
            formData.append('image', formState.imageFile);
        } else if (method === 'POST') {
            setFetchError('La imagen es obligatoria al crear un producto.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo guardar el producto.');
            }

            handleCancel();
            fetchProducts();
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Manejadores de Acciones (Toggle, Edit) ---

    const handleToggleActive = async (productId: number, currentStatus: boolean) => {
        const action = currentStatus ? 'desactivar' : 'activar';
        const endpoint = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`¿Estás seguro de que quieres ${action} este producto?`)) return;

        setFetchError(null);
        const url = `${getApiUrl()}/admin/products/${productId}/${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({})
            });
            if (response.ok) {
                fetchProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `No se pudo ${action} el producto.`);
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : `Error al ${action} el producto.`);
        }
    };

    const handleEditClick = (product: Product) => {
        setFormState({
            name: product.name,
            description: product.description,
            price: String(product.price),
            stock: String(product.stock),
            category_id: String(product.category_id),
            imageFile: null,
            imagePreview: product.image // Mostrar imagen existente
        });
        setIsEditing(product.id);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setIsEditing(null);
        setFormState(initialFormState);
        setIsModalOpen(true);
    };

    // --- Componente Modal ---
    const ModalForm = isModalOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50" onClick={handleCancel}>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} translate="no">
                <h3 className="text-2xl font-extrabold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                    {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h3>
                {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{fetchError}</div>}

                <form onSubmit={handleFormSubmit} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nombre Producto</label>
                            <input type="text" name="name" id="name" value={formState.name} onChange={handleFormChange} required
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                            <select name="category_id" id="category_id" value={formState.category_id} onChange={handleFormChange} required
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white appearance-none">
                                <option value="" disabled>Seleccione una categoría...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1">Precio (MXN)</label>
                            <input type="number" name="price" id="price" value={formState.price} onChange={handleFormChange} required min="0.01" step="0.01"
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-1">Stock (Unidades)</label>
                            <input type="number" name="stock" id="stock" value={formState.stock} onChange={handleFormChange} required min="0" step="1"
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <textarea name="description" id="description" value={formState.description} onChange={handleFormChange} required
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm h-24"
                        />
                    </div>

                    <div className="form-group space-y-3">
                        <label htmlFor="imageFile" className="block text-sm font-semibold text-gray-700 mb-1">
                            Imagen del Producto {isEditing ? '(Opcional: Subir para reemplazar)' : '(Requerida)'}
                        </label>
                        <input type="file" name="imageFile" id="imageFile" onChange={handleFileChange} accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {formState.imagePreview && (
                            <img
                                src={getDisplayImageUrl(formState.imagePreview)}
                                alt="Vista previa"
                                className="w-40 h-40 object-cover rounded-lg shadow-md border"
                            />
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 disabled:opacity-50" onClick={handleCancel} disabled={isLoading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;

    const ModalPortal = isModalOpen ? createPortal(ModalForm, document.body) : null;


    // --- Renderizado Principal ---
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" translate="no">
            <div className="bg-white shadow-xl rounded-xl p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-900 mb-8 border-b-4 border-indigo-100 pb-3">
                    Productos de la Tienda
                </h2>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <button
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
                        onClick={handleCreateClick}
                    >
                        <IconAdd /> <span>Agregar Producto</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative flex items-center border rounded-lg p-2 bg-white w-full md:w-64 shadow-sm">
                            <IconSearch className="text-gray-500 ml-1" />
                            <input
                                type="text"
                                placeholder="Buscar por Nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="outline-none w-full text-gray-700 px-2"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                            className="p-3 border rounded-lg bg-white text-gray-700 shadow-sm outline-none w-full md:w-auto"
                        >
                            <option value="all">Todos</option>
                            <option value="available">Disponibles (Activos)</option>
                            <option value="unavailable">No Disponibles (Inactivos)</option>
                        </select>
                    </div>
                </div>

                {/* Lista de Productos */}
                <div className="mt-8">
                    {isLoading && <p className="text-center">Cargando productos...</p>}
                    {fetchError && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">Error: {fetchError}</div>}

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div
                                    key={product.id}
                                    className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border-t-4 ${product.is_available ? 'border-green-500' : 'border-red-500'}`}
                                >
                                    <div className={`${!product.is_available ? 'opacity-60' : ''}`}>
                                        <div className="relative h-48 w-full">
                                            <img
                                                src={product.image ? getDisplayImageUrl(product.image) : 'https://via.placeholder.com/300x300.png?text=Sin+Imagen'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full text-white ${product.is_available ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {product.is_available ? 'Disponible' : 'Inactivo'}
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            <h4 className="text-xl font-bold text-gray-800">{product.name}</h4>
                                            <p className="text-sm text-gray-500">{product.category_name}</p>
                                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-bold text-indigo-700">${product.price.toFixed(2)} MXN</p>
                                                <p className="text-sm font-medium text-gray-600">Stock: {product.stock}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-3">
                                                <button
                                                    className="flex items-center space-x-1 px-4 py-2 text-sm rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                    onClick={() => handleEditClick(product)}
                                                >
                                                    <IconEdit /> <span>Editar</span>
                                                </button>
                                                <button
                                                    className={`flex items-center space-x-1 px-4 py-2 text-sm rounded-lg text-white ${product.is_available ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                                    onClick={() => handleToggleActive(product.id, product.is_available)}
                                                >
                                                    {product.is_available ? <IconDeactivate /> : <IconActivate />}
                                                    <span>{product.is_available ? 'Desactivar' : 'Activar'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-6 p-6 border-2 border-dashed rounded-xl text-center">
                            No se encontraron productos con los filtros aplicados.
                        </p>
                    )}
                </div>

                {ModalPortal}
            </div>
        </div>
    );
};

export default ProductsAdmin;