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
            // Usamos la URL relativa para que el proxy de Vite la redirija
            const response = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('admin-token', data.token);
                navigate(`/chavez/admin/dashboard`, { replace: true });
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