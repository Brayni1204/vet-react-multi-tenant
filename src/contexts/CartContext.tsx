/* eslint-disable react-refresh/only-export-components */
// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string | null;
    stock: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (product: Product, quantity: number) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.product.id === product.id);
            if (existingItem) {
                // Actualizar cantidad, respetando el stock
                const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
                return prevItems.map(i =>
                    i.product.id === product.id ? { ...i, quantity: newQuantity } : i
                );
            }
            // Agregar nuevo item
            return [...prevItems, { product, quantity }];
        });
    };

    const removeFromCart = (productId: number) => {
        setItems(prevItems => prevItems.filter(i => i.product.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prevItems =>
            prevItems.map(i => {
                if (i.product.id === productId) {
                    // Respetar stock
                    const newQuantity = Math.min(quantity, i.product.stock);
                    return { ...i, quantity: newQuantity };
                }
                return i;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalAmount,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe usarse dentro de un CartProvider');
    }
    return context;
};
