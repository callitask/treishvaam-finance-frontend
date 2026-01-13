// src/App.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WatchlistProvider } from './context/WatchlistContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ThirdPartyScripts from './components/ThirdPartyScripts'; // IMPORT ADDED

/**
 * AI-CONTEXT:
 * Purpose: Root Application Component.
 * Changes: Added <ThirdPartyScripts /> to handle non-blocking Ad/Analytics loading.
 */

// --- Lazy-loaded Page Components ---
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const VisionPage = lazy(() => import('./pages/VisionPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SinglePostPage = lazy(() => import('./pages/SinglePostPage'));
const MarketDetailPage = lazy(() => import('./pages/MarketDetailPage'));
// --- Phase 1: AdSense Compliance Pages ---
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

// --- Lazy-loaded Admin Components ---
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ManagePostsPage = lazy(() => import('./pages/ManagePostsPage'));
const BlogEditorPage = lazy(() => import('./pages/BlogEditorPage'));
const ApiStatusPage = lazy(() => import('./pages/ApiStatusPage'));
const AudiencePage = lazy(() => import('./pages/AudiencePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400">
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WatchlistProvider>
          {/* AI-NOTE: Mount ThirdPartyScripts here to ensure global scope but deferred loading */}
          <ThirdPartyScripts />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<BlogPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/vision" element={<VisionPage />} />
                <Route path="/contact" element={<ContactPage />} />
                {/* Legal Pages for AdSense Compliance */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                <Route path="/market/:ticker" element={<MarketDetailPage />} />
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
                <Route path="profile" element={<ProfilePage />} />
                <Route path="manage-posts" element={<ManagePostsPage />} />
                <Route path="blog/new" element={<BlogEditorPage />} />
                <Route path="blog/edit/:userFriendlySlug/:id" element={<BlogEditorPage />} />
                <Route path="api-status" element={<ApiStatusPage />} />
                <Route path="audience" element={<AudiencePage />} />
              </Route>
            </Routes>
          </Suspense>
        </WatchlistProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;