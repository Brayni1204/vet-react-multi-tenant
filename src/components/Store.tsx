// src/components/Store.tsx
import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext'; // Asumiendo que lo usas aquí también

// --- Interfaces basadas en tu BBDD ---
interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string | null;
}

// --- Helper para formatear precios ---
const formatCurrency = (amount: number, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

// --- Iconos simples ---
const IconStore = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Tienda" {...props}>🛍️</span>;
const IconLoading = (props: React.ComponentPropsWithoutRef<'span'>) => <span role="img" aria-label="Cargando" {...props}>⏳</span>;


const Store: React.FC = () => {
    // El hook 'useTenant' ya nos da la URL base correcta (ej: http://chavez.localhost:4000/api)
    const { getApiUrl, loading: tenantLoading, error: tenantError, tenantData } = useTenant();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Cargar categorías una vez
    useEffect(() => {
        if (!tenantData) return; // Esperar a que el tenant esté listo

        const fetchCategories = async () => {
            try {
                // Usamos getApiUrl() que ya tiene el subdominio resuelto
                const response = await fetch(`${getApiUrl()}/store/categories`);
                if (!response.ok) throw new Error('No se pudieron cargar las categorías.');
                const data = await response.json();
                setCategories(data.categories || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            }
        };
        fetchCategories();
    }, [getApiUrl, tenantData]);

    // 2. Cargar productos cada vez que cambia la categoría seleccionada
    useEffect(() => {
        if (!tenantData) return; // Esperar a que el tenant esté listo

        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);

            // Construimos la URL con parámetros de búsqueda
            const url = new URL(`${getApiUrl()}/store/products`);
            if (selectedCategory !== 'all') {
                url.searchParams.append('category', String(selectedCategory));
            }

            try {
                const response = await fetch(url.toString());
                if (!response.ok) throw new Error('No se pudieron cargar los productos.');
                const data = await response.json();
                setProducts(data.products || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();

    }, [getApiUrl, tenantData, selectedCategory]);

    // --- Renderizado ---

    if (tenantLoading) {
        return <div className="p-8 text-center text-gray-600">Cargando tienda...</div>;
    }

    if (tenantError) {
        return <div className="p-8 text-center text-red-600">Error: {tenantError}</div>;
    }

    // Componente de botón de categoría (para manejar el estado activo)
    const CategoryButton: React.FC<{ id: 'all' | number, name: string }> = ({ id, name }) => {
        const isActive = selectedCategory === id;
        return (
            <button
                onClick={() => setSelectedCategory(id)}
                className={`
                    px-4 py-2 text-sm font-semibold rounded-full transition-all duration-150
                    ${isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                `}
            >
                {name}
            </button>
        );
    };

    return (
        // Usamos 'translate="no"' como en tu ServicesAdmin para evitar traducciones
        <section className="bg-gray-50 py-12 md:py-16" translate="no">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Título */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-8 text-center">
                    <IconStore className="mr-2" />
                    Nuestra Tienda
                </h2>

                {/* Filtros de Categoría */}
                <div className="flex flex-wrap justify-center gap-2 mb-10 px-4">
                    <CategoryButton id="all" name="Todos los Productos" />
                    {categories.map(cat => (
                        <CategoryButton key={cat.id} id={cat.id} name={cat.name} />
                    ))}
                </div>

                {/* Grid de Productos */}
                {isLoading && (
                    <div className="text-center p-12 text-gray-600">
                        <IconLoading className="text-2xl animate-spin" />
                        <p className="mt-2 font-semibold">Cargando productos...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center p-12 bg-red-50 text-red-700 rounded-lg">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="h-56 w-full bg-gray-100">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/300x300.png?text=Sin+Imagen'} // Placeholder
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-5 flex flex-col grow">
                                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 h-14">{product.name}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-3 h-16 mt-1">{product.description}</p>

                                    <div className="mt-4 pt-4 border-t border-gray-100 grow flex flex-col justify-end">
                                        <p className="text-xl font-extrabold text-indigo-700">
                                            {formatCurrency(product.price)}
                                        </p>
                                        <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                                        </p>
                                        <button
                                            className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={product.stock <= 0}
                                        >
                                            {product.stock > 0 ? 'Reservar (Recoger en Tienda)' : 'Agotado'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && !error && products.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500 font-medium">
                            No se encontraron productos en esta categoría.
                        </p>
                    </div>
                )}

            </div>
        </section>
    );
};

export default Store;