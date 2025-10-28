// src/pages/admin/StaffAdmin.tsx (Corregido)
import React, { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAuth, type User } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { FaUserPlus, FaTrash, FaPen, FaUsers } from 'react-icons/fa';
import '../../styles/admin.css';
// Interfaz para el estado del formulario de nuevo personal
interface NewStaffForm {
    name: string;
    email: string;
    password?: string;
    role: 'doctor' | 'receptionist' | 'admin';
}
const StaffAdmin: React.FC = () => {
    // Obtenemos user y token del contexto de Auth
    const { user, token } = useAuth();
    // 🎯 OBTENEMOS tenantData (que contiene el ID numérico y el slug)
    const { tenantData } = useTenant();

    const [staffList, setStaffList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newStaff, setNewStaff] = useState<NewStaffForm>({
        name: '',
        email: '',
        password: '',
        role: 'receptionist'
    });
    const hostname = window.location.hostname;
    // 🎯 FUNCIÓN CORREGIDA para alinearse con ServicesAdmin.tsx: Usa tenantData.id (ID numérico)
    const getBaseUrl = useCallback(() => {
        // Usamos el ID numérico del tenant, que es lo que espera el router de Express en :tenantId
        const tenantIdForUrl = tenantData?.id;
        if (!tenantIdForUrl) return '';
        // Genera: http://[hostname]:4000/api/tenants/[ID_NUMÉRICO]
        return `http://${hostname}:4000/api/tenants/${tenantIdForUrl}`;
    }, [tenantData, hostname]);
    // Helper para construir la URL del recurso de staff
    const getStaffUrl = useCallback(() => {
        return `${getBaseUrl()}/staff`; // Genera: .../api/tenants/[ID_NUMÉRICO]/staff
    }, [getBaseUrl]);
    const fetchStaff = useCallback(async () => {
        // Verificar si tenemos el ID numérico antes de intentar la llamada
        if (!token || !tenantData?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const url = getStaffUrl();
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener personal.');
            }
            setStaffList(data.users.filter((u: User) => u.role !== 'client'));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, tenantData?.id, getStaffUrl]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleCreateStaff = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsCreating(true);
        if (!newStaff.password) {
            setError("La contraseña es obligatoria.");
            setIsCreating(false);
            return;
        }
        try {
            // 🎯 Usamos la URL CORREGIDA
            const url = getStaffUrl();
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newStaff)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al crear personal');
            }
            // Éxito: actualizar la lista y limpiar el formulario
            alert(`Personal ${data.user.name} creado exitosamente como ${data.user.role}!`);
            fetchStaff();
            setNewStaff({ name: '', email: '', password: '', role: 'receptionist' });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };
    // 🔒 Control de acceso a la vista: Solo Admin puede verla
    if (loading) return <div className="loading-screen">Cargando Personal...</div>;
    // Si la carga falló (por ejemplo, el tenantData no estaba disponible), mostramos el error general
    if (error) return <div className="error-message">Error: {error}</div>;
    // Usamos 'admin' como el rol que tiene control total
    if (user?.role !== 'admin') {
        // Si permitieras a Recepcionistas ver la lista, podrías cambiar esta condición.
        return <div className="permission-denied">Acceso denegado. Solo administradores pueden gestionar el personal.</div>;
    }
    const canManage = user.role === 'admin';
    return (
        <div className="admin-content-area">
            <h3><FaUsers /> Gestión de Personal</h3>
            {error && <div className="error-message">{error}</div>}
            {/* 🎯 Formulario de Creación de Personal - Solo si es Admin */}
            {canManage && (
                <div className="card staff-creation">
                    <h4><FaUserPlus /> Crear Nuevo Empleado</h4>
                    <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={newStaff.name}
                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                            required
                            style={{ flex: '1 1 45%' }}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newStaff.email}
                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                            required
                            style={{ flex: '1 1 45%' }}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña (temporal)"
                            value={newStaff.password}
                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                            required
                            style={{ flex: '1 1 45%' }}
                        />
                        <select
                            value={newStaff.role}
                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as NewStaffForm['role'] })}
                            style={{ flex: '1 1 45%' }}
                            disabled={!canManage}
                        >
                            <option value="receptionist">Recepcionista</option>
                            <option value="doctor">Médico</option>
                            {canManage && <option value="admin">Administrador</option>}
                        </select>
                        <button type="submit" disabled={isCreating || !canManage} className="btn-primary" style={{ flex: '1 1 100%' }}>
                            {isCreating ? 'Creando...' : 'Crear Personal'}
                        </button>
                    </form>
                </div>
            )}
            {/* 🎯 Lista de Personal */}
            <div className="card staff-list">
                <h4>Personal Registrado ({staffList.length})</h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staffMember) => (
                            <tr key={staffMember.id}>
                                <td>{staffMember.name}</td>
                                <td>{staffMember.email}</td>
                                <td>
                                    <strong>{staffMember.role}</strong>
                                </td>
                                <td>
                                    {/* ⚠️ Acciones de edición/eliminación (solo si es admin y no es uno mismo) */}
                                    <button className="btn-icon" title="Editar" disabled={!canManage}><FaPen /></button>
                                    {user && user.id !== staffMember.id && canManage && (
                                        <button className="btn-icon btn-danger" title="Eliminar"><FaTrash /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffAdmin;