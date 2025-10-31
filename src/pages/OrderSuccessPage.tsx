import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';

// (Helper de formato de moneda)
const formatCurrency = (amount: number, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Página de éxito que se muestra después de confirmar una reserva.
 */
const OrderSuccessPage: React.FC = () => {
    const location = useLocation();

    // Obtenemos los datos pasados desde la página de Checkout
    const { orderId, total } = (location.state as { orderId?: number, total?: number }) || {};

    // Si no hay datos (ej. el usuario entró a la URL directo),
    // lo regresamos a la tienda.
    if (!orderId || total === undefined) {
        return <Navigate to="/tienda" replace />;
    }

    return (
        <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '600px', margin: 'auto' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#4F46E5', fontWeight: 'bold' }}>¡Gracias por tu reserva!</h1>
            <p style={{ fontSize: '1.2rem', color: '#374151', marginTop: '1rem' }}>
                Tu pedido ha sido confirmado.
            </p>

            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', marginTop: '2rem' }}>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>NÚMERO DE ORDEN:</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0.5rem 0' }}>
                    #{orderId}
                </p>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '1rem' }}>TOTAL A PAGAR EN TIENDA:</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16A34A' }}>
                    {formatCurrency(total)}
                </p>
            </div>

            <p style={{ color: '#4B5563', marginTop: '2rem', lineHeight: '1.6' }}>
                Recuerda que deberás pagar el monto total al momento de recoger tu pedido en la clínica.
                ¡Lo tendremos listo para ti en la fecha que seleccionaste!
            </p>

            <Link
                to="/tienda"
                className="btn primary"
                style={{
                    display: 'inline-block',
                    marginTop: '2rem',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    padding: '12px 24px'
                }}
            >
                Volver a la Tienda
            </Link>
        </div>
    );
};

export default OrderSuccessPage;

