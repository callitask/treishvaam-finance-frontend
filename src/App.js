import { Routes, Route, Navigate } from 'react-router-dom';
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
import DashboardPage from './pages/DashboardPage';

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
          {/* --- UPDATED ROUTE --- */}
          <Route path="/blog/:slug" element={<SinglePostPage />} />
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
           {/* --- UPDATED ROUTE --- */}
          <Route path="blog/edit/:slug" element={<BlogEditorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;