// src/pages/CheckoutPage.tsx
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext.tsx';
import { useClientAuth } from '../contexts/ClientAuthContext.tsx';
import { useTenant } from '../contexts/TenantContext.tsx';
import { useNavigate } from 'react-router-dom';
// Asegúrate de tener react-icons instalado: npm install react-icons
import { FaTrash } from 'react-icons/fa';

// (Helper de formato de moneda)
const formatCurrency = (amount: number, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

const CheckoutPage: React.FC = () => {
    const { items, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
    const { token } = useClientAuth();
    const { getApiUrl } = useTenant();
    const navigate = useNavigate();

    const [pickupDate, setPickupDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener fecha mínima (mañana)
    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Mañana
        return today.toISOString().split('T')[0];
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickupDate) {
            setError('Por favor, selecciona una fecha para recoger tu pedido.');
            return;
        }
        if (items.length === 0) {
            setError('Tu carrito está vacío.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const orderData = {
            items: items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            })),
            pickupDate: pickupDate
        };

        try {
            const response = await fetch(`${getApiUrl()}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'No se pudo procesar la reserva.');
            }

            // Éxito
            clearCart();
            navigate('/order-success', { state: { orderId: data.orderId, total: data.total } });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-12" translate="no">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-extrabold text-indigo-900 mb-8">Confirmar Reserva</h1>

                {items.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600">Tu carrito está vacío.</p>
                        <button onClick={() => navigate('/tienda')} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700">
                            Ir a la Tienda
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Columna de Items y Fecha */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Fecha de Recojo */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold mb-4">1. Elige tu fecha de recojo</h2>
                                <p className="text-sm text-gray-600 mb-3">Pagarás en la tienda al momento de recoger.</p>
                                <label htmlFor="pickupDate" className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    id="pickupDate"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    min={getMinDate()} // No se puede recoger hoy mismo
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                                />
                            </div>

                            {/* Lista de Items */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold mb-4">2. Productos a Reservar</h2>
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.product.id} className="flex items-center gap-4 border-b pb-4">
                                            <img
                                                src={item.product.image || 'https://placehold.co/100x100/E2E8F0/94A3B8?text=Sin+Imagen'}
                                                alt={item.product.name}
                                                className="w-20 h-20 rounded-md object-cover"
                                            />
                                            <div className="grow">
                                                <h3 className="font-semibold">{item.product.name}</h3>
                                                <p className="text-sm text-gray-500">{formatCurrency(item.product.price)} c/u</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                                                    min="1"
                                                    max={item.product.stock}
                                                    className="w-16 p-2 border rounded-md text-center"
                                                />
                                                <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Columna de Resumen */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                                <h2 className="text-xl font-bold mb-4 border-b pb-3">Resumen del Pedido</h2>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Envío:</span>
                                        <span className="font-medium">Recoger en Tienda</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                                        <span>Total a Pagar:</span>
                                        <span>{formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>

                                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                                <button type="submit" className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50" disabled={isLoading}>
                                    {isLoading ? 'Procesando...' : 'Confirmar Reserva'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
