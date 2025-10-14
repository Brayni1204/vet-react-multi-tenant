import React from 'react';
import type { PropsWithChildren } from 'react'; // Importación corregida
import { NavLink } from 'react-router-dom';
import '../../styles/admin.css';

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>Admin</h2>
                </div>
                <nav className="admin-nav">
                    <ul>
                        <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
                        <li><NavLink to="/admin/services">Servicios</NavLink></li>
                        <li><NavLink to="/admin/profile">Mi Clínica</NavLink></li>
                        {/* Agrega más enlaces de navegación aquí */}
                        <li><NavLink to="/">Cerrar Sesión</NavLink></li>
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;