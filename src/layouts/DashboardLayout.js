// src/layouts/DashboardLayout.js
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaTachometerAlt, FaFileAlt, FaPlusSquare, FaBars, FaTimes, FaFileSignature, FaServer, FaChartBar } from 'react-icons/fa';

const NavLink = ({ to, icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname + location.hash === to;
    return (
        <Link
            to={to}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 
                ${isActive
                    ? 'bg-sky-100 text-sky-600 dark:bg-slate-700 dark:text-sky-400'
                    : 'text-gray-700 hover:bg-sky-100 hover:text-sky-600 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
        >
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );
};

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const sidebarContent = (
        <div className="p-4 bg-white dark:bg-slate-900 border-r dark:border-slate-700 h-full">
            <nav className="flex-grow space-y-1">
                <NavLink to="/dashboard" icon={<FaTachometerAlt />}>Dashboard</NavLink>
                <NavLink to="/dashboard/manage-posts" icon={<FaFileAlt />}>Manage Posts</NavLink>
                <NavLink to="/dashboard/manage-posts#drafts" icon={<FaFileSignature />}>Drafts</NavLink>
                <NavLink to="/dashboard/blog/new" icon={<FaPlusSquare />}>Create Post</NavLink>
                <NavLink to="/dashboard/api-status" icon={<FaServer />}>API Status</NavLink>
                <NavLink to="/dashboard/audience" icon={<FaChartBar />}>Audience</NavLink>
            </nav>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden md:flex w-64 flex-col flex-shrink-0">
                    {sidebarContent}
                </aside>
                <div className={`fixed inset-0 z-30 flex transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="w-64 bg-white dark:bg-slate-900 flex flex-col flex-shrink-0 border-r dark:border-slate-700">
                        <div className="flex justify-end p-2">
                            <button onClick={() => setIsSidebarOpen(false)} className="text-2xl text-gray-600 dark:text-gray-400"><FaTimes /></button>
                        </div>
                        {sidebarContent}
                    </div>
                    <div className="flex-1 bg-black opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
                </div>
                <main className="flex-1 overflow-y-auto">
                    <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Dashboard Menu</h2>
                        <button onClick={() => setIsSidebarOpen(true)} className="text-2xl text-gray-600 dark:text-gray-400">
                            <FaBars />
                        </button>
                    </div>
                    <div className="p-4 md:p-6 text-gray-800 dark:text-gray-100">
                        <Outlet />
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardLayout;