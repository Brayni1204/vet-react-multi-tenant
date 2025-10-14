import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.css'; // Reutilizaremos los estilos de autenticación

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de autenticación de administrador simulada
        if (email === 'admin@vet.com' && password === 'password') {
            console.log('Admin logged in successfully!');
            // En una aplicación real, aquí guardarías el token de autenticación
            // y redirigirías al dashboard de administración.
            navigate('/admin/dashboard');
        } else {
            alert('Credenciales incorrectas. Intenta de nuevo.');
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