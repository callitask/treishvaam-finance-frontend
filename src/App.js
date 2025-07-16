import { Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import VisionPage from './pages/VisionPage';
import EducationPage from './pages/EducationPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import LoginPage from './pages/LoginPage';
import BlogEditorPage from './pages/BlogEditorPage';
import ManagePostsPage from './pages/ManagePostsPage';
import SettingsPage from './pages/SettingsPage';
import SinglePostPage from './pages/SinglePostPage';
import DashboardPage from './pages/DashboardPage'; // Import DashboardPage

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/blog" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<SinglePostPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Redirect for old /manage-posts path */}
        {/* MODIFIED: Added a redirect for /manage-posts */}
        <Route path="/manage-posts" element={<Navigate to="/dashboard/manage-posts" replace />} />

        {/* Private Admin Routes */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
        >
          {/* Explicitly set index to DashboardPage, manage-posts is a separate route */}
          <Route index element={<DashboardPage />} />
          <Route path="manage-posts" element={<ManagePostsPage />} />
          <Route path="blog/new" element={<BlogEditorPage />} />
          <Route path="blog/edit/:id" element={<BlogEditorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
