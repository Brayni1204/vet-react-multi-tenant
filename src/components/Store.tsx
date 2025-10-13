import React from 'react';
import '../styles/Store.css';

interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    price: string;
}

const productsData: Product[] = [
    {
        id: 1,
        name: 'Alimento Premium para Perro',
        description: 'Nutrición completa para perros de todas las edades. Hecho con ingredientes naturales.',
        image: '/images/alimento-perro.jpg',
        price: '$500 MXN',
    },
    {
        id: 2,
        name: 'Juguete Interactivo para Gato',
        description: 'Mantiene a tu gato activo y entretenido por horas. Con materiales duraderos.',
        image: '/images/juguete-gato.jpg',
        price: '$150 MXN',
    },
    {
        id: 3,
        name: 'Kit de Grooming para Cachorros',
        description: 'Incluye cepillo, shampoo y cortauñas para el cuidado de tu cachorro.',
        image: '/images/kit-grooming.jpg',
        price: '$300 MXN',
    },
];

const Store: React.FC = () => {
    return (
        <section className="store">
            <h2>Nuestra Tienda</h2>
            <div className="product-grid">
                {productsData.map(product => (
                    <div key={product.id} className="product-card">
                        <img src={product.image} alt={product.name} />
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                            <p className="product-price">{product.price}</p>
                            <button className="btn primary small">Comprar</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Store;