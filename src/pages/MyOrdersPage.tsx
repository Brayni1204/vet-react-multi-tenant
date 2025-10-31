import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../contexts/ClientAuthContext'; // 👈 Ruta corregida
import { useTenant } from '../contexts/TenantContext'; // 👈 Ruta corregida
import { Link } from 'react-router-dom';

// --- Interfaces ---
interface OrderItem {
    product_id: number;
    quantity: number;
    unit_price: number;
    product_name: string;
    product_image: string | null;
}

interface Order {
    id: number;
    total_amount: number;
    status: 'pending_pickup' | 'ready_for_pickup' | 'picked_up' | 'cancelled' | 'expired';
    pickup_date: string; // 'YYYY-MM-DD'
    created_at: string; // ISO 8601
    items: OrderItem[];
}

// --- Helpers ---
const formatCurrency = (amount: number, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

// Formatea fechas como "31 de octubre de 2025"
const formatDate = (dateString: string) => {
    // Usamos split para asegurar que la fecha se interprete como local y no UTC
    const parts = dateString.split('T')[0].split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Le decimos que la fecha base ya está en UTC (para evitar corrimientos)
    });
};

const getStatusInfo = (status: Order['status']) => {
    switch (status) {
        case 'pending_pickup':
            return { text: 'Pendiente de Preparación', color: 'bg-yellow-100 text-yellow-800' };
        case 'ready_for_pickup':
            return { text: 'Listo para Recoger', color: 'bg-blue-100 text-blue-800' };
        case 'picked_up':
            return { text: 'Recogido', color: 'bg-green-100 text-green-800' };
        case 'cancelled':
        case 'expired':
            return { text: 'Cancelado', color: 'bg-red-100 text-red-800' };
        default:
            return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
};

// --- Componente ---
const MyOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { getApiUrl } = useTenant();
    const { token } = useClientAuth();

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            setError("Debes iniciar sesión para ver tus pedidos.");
            return;
        }

        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${getApiUrl()}/orders/my-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'No se pudieron cargar los pedidos.');
                }
                setOrders(data.orders || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar pedidos.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [getApiUrl, token]);

    return (
        <div className="bg-gray-100 min-h-screen py-12" translate="no">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-extrabold text-indigo-900 mb-8">Mis Pedidos</h1>

                {isLoading && (
                    <div className="text-center p-12 text-gray-600">
                        <p className="mt-2 font-semibold">Cargando historial...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center p-12 bg-red-50 text-red-700 rounded-lg">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && orders.length === 0 && (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600">Aún no tienes reservas.</p>
                        <Link to="/tienda" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700">
                            Ir a la Tienda
                        </Link>
                    </div>
                )}

                {!isLoading && !error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map(order => {
                            const status = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {/* Encabezado del Pedido */}
                                    <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
                                        <div>
                                            <p className="text-sm text-gray-500">RESERVA REALIZADA</p>
                                            <p className="font-medium text-gray-800">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">FECHA DE RECOJO</p>
                                            <p className="font-medium text-gray-800">{formatDate(order.pickup_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">TOTAL</p>
                                            <p className="font-bold text-lg text-indigo-700">{formatCurrency(order.total_amount)}</p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm text-gray-500">ORDEN #{order.id}</p>
                                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items del Pedido */}
                                    <div className="p-4">
                                        {order.items.map(item => (
                                            <div key={item.product_id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                                                <img
                                                    src={item.product_image || 'https://placehold.co/100x100/E2E8F0/94A3B8?text=Sin+Imagen'}
                                                    alt={item.product_name}
                                                    className="w-16 h-16 rounded-md object-cover"
                                                />
                                                <div className="grow">
                                                    <p className="font-semibold text-gray-800">{item.product_name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantity} x {formatCurrency(item.unit_price)}
                                                    </p>
                                                </div>
                                                <p className="font-semibold text-gray-800">
                                                    {formatCurrency(item.quantity * item.unit_price)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;