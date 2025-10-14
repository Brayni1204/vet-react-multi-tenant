import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-page">
            <h2>Dashboard</h2>
            <p>Bienvenido al panel de administración. Aquí puedes gestionar la información de tu clínica.</p>
            {/* Aquí se podría mostrar un resumen de citas, estadísticas, etc. */}
        </div>
    );
};

export default Dashboard;