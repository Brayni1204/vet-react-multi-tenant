import React, { type PropsWithChildren } from 'react';

// Define el tipo de las props para que incluya `children`
const AuthLayout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="auth-layout">
            {children}
        </div>
    );
};

export default AuthLayout;