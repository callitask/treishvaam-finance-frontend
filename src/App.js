// src/App.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// --- Lazy-loaded Page Components ---
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const VisionPage = lazy(() => import('./pages/VisionPage'));
const EducationPage = lazy(() => import('./pages/EducationPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SinglePostPage = lazy(() => import('./pages/SinglePostPage'));
const MarketDetailPage = lazy(() => import('./pages/MarketDetailPage')); // --- NEW ---

// --- Lazy-loaded Admin Components ---
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ManagePostsPage = lazy(() => import('./pages/ManagePostsPage'));
const BlogEditorPage = lazy(() => import('./pages/BlogEditorPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ApiStatusPage = lazy(() => import('./pages/ApiStatusPage'));
const AudiencePage = lazy(() => import('./pages/AudiencePage')); // NEW IMPORT

// A simple loading component to show while pages are loading
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<BlogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/market/:ticker" element={<MarketDetailPage />} /> {/* --- NEW --- */}
            <Route path="/blog" element={<Navigate to="/" replace />} />
            <Route path="/category/:categorySlug/:userFriendlySlug/:urlArticleId" element={<SinglePostPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route path="/manage-posts" element={<Navigate to="/dashboard/manage-posts" replace />} />

          {/* Private Admin Routes */}
          <Route
            path="/dashboard"
            element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
          >
            <Route index element={<DashboardPage />} />
            <Route path="manage-posts" element={<ManagePostsPage />} />
            <Route path="blog/new" element={<BlogEditorPage />} />
            <Route path="blog/edit/:userFriendlySlug/:id" element={<BlogEditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="api-status" element={<ApiStatusPage />} />
            <Route path="audience" element={<AudiencePage />} /> {/* NEW ROUTE */}
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;