import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 🚨 CAMBIO CLAVE: Usa el hostname completo con el puerto del backend (4000)
            const hostname = window.location.hostname; // Será 'chavez.localhost'
            const targetUrl = `http://${hostname}:4000/api/auth/admin/login`;

            const response = await fetch(targetUrl, { // <--- Usamos la URL completa
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Ojo: Si el backend devuelve el ID del inquilino, úsalo para la navegación
                // Asumo que 'chavez' viene de 'window.location.hostname' o el backend lo devuelve.
                // Si tienes acceso al TenantContext, úsalo. Por simplicidad, extraemos el slug del host.
                /* const tenantSlug = hostname.split('.')[0]; */
                localStorage.setItem('admin-token', data.token);
                navigate(`/admin/dashboard`, { replace: true });
            } else {
                alert('Credenciales incorrectas. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            alert('Ocurrió un error al intentar iniciar sesión.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Acceso de Administrador</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn primary block">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;