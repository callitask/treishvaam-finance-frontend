import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import VisionPage from './pages/VisionPage';
import EducationPage from './pages/EducationPage';
import ServicesPage from './pages/ServicesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  // This component conditionally renders the layout
  const Layout = () => {
    if (isDashboard) {
      return (
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      );
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  };

  return <Layout />;
}

export default App;
