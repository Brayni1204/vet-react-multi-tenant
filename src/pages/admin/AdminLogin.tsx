// src/pages/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 🚨 Importar useAuth
import '../../styles/auth.css';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null); // 🆕 Nuevo estado de error
    const [isLoading, setIsLoading] = useState(false); // 🆕 Estado de carga

    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth(); // 🚨 Usamos el hook de Auth

    // 🚨 EFECTO CLAVE: Redirige si el usuario ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setIsLoading(true);

        try {
            const hostname = window.location.hostname;
            const targetUrl = `http://${hostname}:4000/api/auth/admin/login`;

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // 🚨 Usamos la función de login del contexto
                login(data.token);
                // navigate a /admin/dashboard se manejará automáticamente por el useEffect

            } else {
                const errorData = await response.json();
                setLoginError(errorData.message || 'Credenciales incorrectas. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            setLoginError('Ocurrió un error al intentar iniciar sesión. Verifica la conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    // Si está autenticado, no renderizamos el formulario (la redirección ocurrirá en el useEffect)
    if (isAuthenticated) {
        return <div>Redirigiendo...</div>;
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Acceso de Administrador</h2>
                <form onSubmit={handleSubmit}>
                    {loginError && <div className="error-message">{loginError}</div>} {/* Mostrar error */}
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
                    <button type="submit" className="btn primary block" disabled={isLoading}>
                        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;