/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/auth.css';
import { useClientAuth } from '../../contexts/ClientAuthContext.tsx'; // 👈 Usar el contexto de CLIENTE

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useClientAuth(); // 👈 Hook de Auth de Cliente
    const navigate = useNavigate();
    const location = useLocation();

    // Mensaje de éxito post-registro
    const successMessage = (location.state as any)?.message;
    // URL a la que volver (ej. /checkout)
    const from = (location.state as any)?.from?.pathname || '/tienda';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            // Éxito
            navigate(from, { replace: true }); // Redirigir a la página anterior o a la tienda
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Iniciar sesión</h2>
                {error && <p className="auth-error">{error}</p>}
                {successMessage && <p className="auth-success">{successMessage}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn primary block" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className="auth-link">
                    ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;