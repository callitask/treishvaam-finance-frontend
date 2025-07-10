
import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <nav className="flex items-center space-x-4">
                    {/* FIX: Link to manage-posts explicitly */}
                    <Link to="/dashboard/manage-posts" className="text-gray-600 hover:text-sky-600">Manage Posts</Link>
                    <Link to="/dashboard/blog/new" className="text-gray-600 hover:text-sky-600">Create Post</Link>
                </nav>
                <div>
                    <span className="mr-4 text-sm text-gray-700">{auth.user?.email}</span>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
