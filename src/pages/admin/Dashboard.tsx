// src/pages/admin/Dashboard.tsx
import React from 'react';
import { FaPaw, FaCalendarAlt, FaDollarSign, FaUsers } from 'react-icons/fa';
import '../../styles/admin.css';

// Datos de ejemplo para el dashboard
const summaryData = [
    { title: "Citas Pendientes", value: 12, icon: <FaCalendarAlt />, color: "#E63946" }, // Rojo para atención
    { title: "Mascotas Registradas", value: 450, icon: <FaPaw />, color: "#1D3557" }, // Nuevo Color Primario
    { title: "Ingresos (Mes)", value: "$45k", icon: <FaDollarSign />, color: "#28a745" }, // Verde para éxito
    { title: "Clientes Activos", value: 320, icon: <FaUsers />, color: "#F4D35E" }, // Amarillo para información
];

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-page">
            <h2>Dashboard General</h2>
            <p>Bienvenido al panel de administración. Aquí tienes un resumen de la actividad de tu clínica.</p>

            {/* Sección de Widgets de Resumen */}
            <div className="dashboard-widgets">
                {summaryData.map((data, index) => (
                    <div
                        key={index}
                        className="summary-card"
                        // El color de acento se aplica al borde y al valor.
                        style={{ borderLeftColor: data.color }}
                    >
                        <div style={{ color: data.color, marginLeft: 'auto', fontSize: '2rem' }}>
                            {data.icon}
                        </div>
                        <h3>{data.title}</h3>
                        <div className="value" style={{ color: data.color }}>
                            {data.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sección de Detalles/Gráficos */}
            <div className="dashboard-details">
                <h3>Actividad Reciente y Gráficos</h3>
                <p>Monitoreo de citas y rendimiento de servicios clave.</p>

                <div style={{
                    height: '350px',
                    backgroundColor: 'var(--admin-bg-color)',
                    borderRadius: 'var(--admin-border-radius)',
                    padding: '20px',
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--admin-text-color)',
                    opacity: 0.7,
                    border: '1px dashed var(--admin-border-color)'
                }}>
                    [Placeholder para Gráfico de Servicios más Solicitados]
                </div>
            </div>
        </div>
    );
};

export default Dashboard;