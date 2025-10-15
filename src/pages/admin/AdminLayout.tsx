// src/pages/admin/AdminLayout.tsx
import React from 'react';
import type { PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('admin-token');
        navigate('/admin/login');
    };

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
                        <li><a onClick={handleLogout}>Cerrar Sesión</a></li>
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