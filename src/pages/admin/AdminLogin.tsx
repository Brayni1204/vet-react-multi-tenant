// src/pages/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 🚨 Importar useAuth, AÑADIENDO `logout`
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';
// Nota: No necesitamos definir API_BASE_URL aquí; el AuthContext lo maneja.
const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    // 🎯 CORRECCIÓN: Agregamos `logout` a la desestructuración
    const { isAuthenticated, login, user, logout } = useAuth();
    // 🚨 EFECTO CLAVE: Redirige si el usuario ya está autenticado Y es personal
    // Ahora usa el rol para la redirección.
    useEffect(() => {
        if (isAuthenticated && user && user.role !== 'client') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate, user]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setIsLoading(true);
        try {
            await login(email, password, true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // El error es lanzado por AuthContext, lo capturamos aquí
            setLoginError(error.message || 'Error de autenticación. Verifica email y contraseña.');
        } finally {
            setIsLoading(false);
        }
    };
    // Si está autenticado, no renderizamos el formulario (la redirección ocurrirá en el useEffect)
    if (isAuthenticated && user?.role !== 'client') {
        return <div>Redirigiendo al panel administrativo...</div>;
    }
    // Si está autenticado pero como cliente, lo tratamos como un error de acceso
    if (isAuthenticated && user?.role === 'client') {
        // Podrías redirigir al login público o mostrar un mensaje de error.
        return <div className="auth-container">
            <div className="auth-card">
                <div className="error-message">Acceso denegado. Estás logueado como cliente.</div>
                {/* 🎯 Botón para cerrar sesión si es cliente (ahora que `logout` está definido) */}
                <button onClick={logout} className="btn block">Cerrar Sesión</button>
            </div>
        </div>
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Acceso de Personal</h2>
                <form onSubmit={handleSubmit}>
                    {loginError && <div className="error-message">{loginError}</div>}
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