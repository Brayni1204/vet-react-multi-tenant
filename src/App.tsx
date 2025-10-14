import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Services from './components/Services';
import Store from './components/Store';
import Emergency from './components/Emergency';
import Contact from './components/Contact';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AppointmentPage from './pages/Appointment';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ServicesAdmin from './pages/admin/ServicesAdmin';
import ProfileAdmin from './pages/admin/ProfileAdmin';
import AdminLogin from './pages/admin/AdminLogin';
import AuthLayout from './pages/AuthLayout';

import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const authRoutes = ['/login', '/register', '/admin/login'];
  const shouldShowHeaderFooter = !authRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin');

  return (
    <Router>
      <TenantProvider>
        <AuthProvider>
          <ScrollToTop />
          {shouldShowHeaderFooter && <Header isScrolled={isScrolled} />}
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/servicios" element={<Services />} />
              <Route path="/tienda" element={<Store />} />
              <Route path="/urgencias" element={<Emergency />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/citas" element={<AppointmentPage />} />

              <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
              <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

              {/* Rutas protegidas */}
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="services" element={<ServicesAdmin />} />
                      <Route path="profile" element={<ProfileAdmin />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />
            </Routes>
          </main>
          {shouldShowHeaderFooter && <Footer />}
        </AuthProvider>
      </TenantProvider>
    </Router>
  );
}

export default App;