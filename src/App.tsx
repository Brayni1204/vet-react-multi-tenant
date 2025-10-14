import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Services from './components/Services';
import Store from './components/Store';
import Emergency from './components/Emergency';
import Contact from './components/Contact';

// Páginas de autenticación y citas
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AppointmentPage from './pages/Appointment';

// Componentes del panel de administración
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ServicesAdmin from './pages/admin/ServicesAdmin';
import ProfileAdmin from './pages/admin/ProfileAdmin';

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

  // ... lógica para mostrar u ocultar Header/Footer ...
  const authRoutes = ['/login', '/register', '/admin/login'];
  const shouldShowHeaderFooter = !authRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin');

  return (
    <Router>
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

          {/* Rutas públicas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas para el panel de administración */}
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/services" element={<AdminLayout><ServicesAdmin /></AdminLayout>} />
          <Route path="/admin/profile" element={<AdminLayout><ProfileAdmin /></AdminLayout>} />
        </Routes>
      </main>
      {shouldShowHeaderFooter && <Footer />}
    </Router>
  );
}

export default App;