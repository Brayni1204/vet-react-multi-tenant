import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Providers
import { TenantProvider } from './contexts/TenantContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx'; // Admin
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { ClientAuthProvider } from './contexts/ClientAuthContext.tsx'; // Cliente
import { CartProvider } from './contexts/CartContext.tsx'; // Carrito

// Layouts y Componentes
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import TenantHeadManager from './components/TenantHeadManager.tsx';
import AuthLayout from './pages/AuthLayout.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';

// Páginas Públicas
import Home from './pages/Home.tsx';
import ServicesPage from './components/Services.tsx';
import StorePage from './components/Store.tsx';
import EmergencyPage from './components/Emergency.tsx';
import ContactPage from './components/Contact.tsx';
import AppointmentPage from './pages/Appointment.tsx';

// Páginas de Auth
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import AdminLogin from './pages/admin/AdminLogin.tsx';

// Páginas de Tienda (Cliente)
import CheckoutPage from './pages/CheckoutPage.tsx';
import OrderSuccessPage from './pages/OrderSuccessPage.tsx';

// Rutas Protegidas
import ProtectedRoute from './components/ProtectedRoute.tsx'; // Admin
import ClientProtectedRoute from './components/ClientProtectedRoute.tsx'; // Cliente

// Páginas de Admin
import Dashboard from './pages/admin/Dashboard.tsx';
import ServicesAdmin from './pages/admin/ServicesAdmin.tsx';
import ProfileAdmin from './pages/admin/ProfileAdmin.tsx';
import StaffAdmin from './pages/admin/StaffAdmin.tsx';
import CategoriesAdmin from './pages/admin/CategoriesAdmin.tsx';
import ProductsAdmin from './pages/admin/ProductsAdmin.tsx';

import './App.css';

// Layout para páginas públicas (con Header/Footer)
const PublicLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Header isScrolled={isScrolled} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};


function App() {
  return (
    <Router>
      <TenantProvider>
        <AuthProvider>       {/* Admin */}
          <ClientAuthProvider> {/* Cliente */}
            <CartProvider>     {/* Carrito */}
              <ThemeProvider>
                <ScrollToTop />
                <TenantHeadManager />

                <Routes>
                  {/* 1. Rutas Públicas (con Header/Footer) */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="servicios" element={<ServicesPage />} />
                    <Route path="tienda" element={<StorePage />} />
                    <Route path="urgencias" element={<EmergencyPage />} />
                    <Route path="contacto" element={<ContactPage />} />
                    <Route path="citas" element={<AppointmentPage />} />
                  </Route>

                  {/* 2. Rutas de Auth (Sin Header/Footer) */}
                  <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
                  <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
                  <Route path="/admin/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />

                  {/* 3. Rutas de Cliente Protegidas (Requiere login de cliente) */}
                  <Route element={<ClientProtectedRoute />}>
                    <Route path="/checkout" element={<AuthLayout><CheckoutPage /></AuthLayout>} />
                    <Route path="/order-success" element={<AuthLayout><OrderSuccessPage /></AuthLayout>} />
                  </Route>

                  {/* 4. Rutas de Admin Protegidas (Requiere login de admin) */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <Routes>
                          <Route index element={<Navigate to="dashboard" replace />} />
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="services" element={<ServicesAdmin />} />
                          <Route path="categories" element={<CategoriesAdmin />} />
                          <Route path="products" element={<ProductsAdmin />} />
                          <Route path="staff" element={<StaffAdmin />} />
                          <Route path="profile" element={<ProfileAdmin />} />
                          <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                      </AdminLayout>
                    </ProtectedRoute>
                  } />

                  {/* 5. Ruta Catcher */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ThemeProvider>
            </CartProvider>
          </ClientAuthProvider>
        </AuthProvider>
      </TenantProvider>
    </Router>
  );
}

export default App;

