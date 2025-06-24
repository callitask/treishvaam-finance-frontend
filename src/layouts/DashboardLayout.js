import React from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import DashboardPage from '../pages/DashboardPage';

const MyCoursesPage = () => <h1 className="text-3xl font-semibold text-gray-800">My Courses</h1>;
const BlogEditorPage = () => <h1 className="text-3xl font-semibold text-gray-800">Blog Editor</h1>;
const SettingsPage = () => <h1 className="text-3xl font-semibold text-gray-800">Settings</h1>;

const Sidebar = () => {
  const getLinkClass = ({ isActive }) => `flex items-center px-6 py-3 mt-2 text-gray-600 transition-colors duration-300 transform rounded-lg ${isActive ? 'sidebar-active' : 'sidebar-link'}`;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-20 shadow-md">
        <NavLink to="/" className="flex items-center">
          <LazyLoadImage src="/logo.png" alt="Logo" className="h-10 w-auto mr-2" effect="blur" />
          <span className="text-xl font-bold" style={{ color: 'var(--primary-dark)' }}>Treishvaam</span>
        </NavLink>
      </div>
      <div className="flex flex-col justify-between flex-grow">
        <nav className="mt-5 flex-grow">
          <NavLink to="/dashboard" end className={getLinkClass}><span className="mx-3">Dashboard</span></NavLink>
          <NavLink to="/dashboard/courses" className={getLinkClass}><span className="mx-3">My Courses</span></NavLink>
          <NavLink to="/dashboard/editor" className={getLinkClass}><span className="mx-3">Blog Editor</span></NavLink>
          <NavLink to="/dashboard/settings" className={getLinkClass}><span className="mx-3">Settings</span></NavLink>
        </nav>
        <div className="px-6 py-4">
          <button onClick={handleLogout} className="flex items-center text-gray-600 sidebar-link w-full">
            <span className="mx-3">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="courses" element={<MyCoursesPage />} />
              <Route path="editor" element={<BlogEditorPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
