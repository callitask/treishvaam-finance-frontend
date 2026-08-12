"use client";
/**
 * AI-CONTEXT:
 * Purpose: Layout wrapper for the Dashboard section.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom <Outlet /> to Next.js {children} prop.
 * - EDITED: Removed duplicate Navbar and Footer (handled by root layout.tsx).
 * - EDITED: Updated imports to use react-router-shim for Next.js compatibility.
 * 
 * - EDITED (Phase 4 - Enterprise Cloudflare Radar UI):
 * • Refactored into a high-density, collapsible sidebar.
 * • Migrated palette from gray/sky to slate monochromatic for aesthetic cohesion.
 * • Implemented `w-56` to `w-16` transition state.
 */
import React, { useState } from 'react';
import { FaTachometerAlt, FaFileAlt, FaPlusSquare, FaBars, FaTimes, FaFileSignature, FaServer, FaChartBar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link, useLocation } from '../utils/react-router-shim';
import PrivateRoute from '../components/PrivateRoute';

const NavLink = ({ to, icon, children, isCollapsed }) => {
    const location = useLocation();
    const isActive = location.pathname + location.hash === to;
    return (
        <Link
            to={to}
            title={isCollapsed ? children : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 text-sm font-medium rounded transition-all duration-200 
                ${isActive
                    ? 'bg-slate-800 text-white border-l-2 border-slate-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
                }`}
        >
            <span className="text-lg">{icon}</span>
            {!isCollapsed && <span className="ml-3 truncate">{children}</span>}
        </Link>
    );
};

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 transition-all duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
                {!isCollapsed && <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Menu</span>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:block text-slate-500 hover:text-slate-300 transition-colors"
                >
                    {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
                </button>
            </div>
            <nav className="flex-grow space-y-1.5 p-2">
                <NavLink to="/dashboard" icon={<FaTachometerAlt />} isCollapsed={isCollapsed}>Dashboard</NavLink>
                <NavLink to="/dashboard/manage-posts" icon={<FaFileAlt />} isCollapsed={isCollapsed}>Manage Posts</NavLink>
                <NavLink to="/dashboard/manage-posts#drafts" icon={<FaFileSignature />} isCollapsed={isCollapsed}>Drafts</NavLink>
                <NavLink to="/dashboard/blog/new" icon={<FaPlusSquare />} isCollapsed={isCollapsed}>Create Post</NavLink>
                <NavLink to="/dashboard/api-status" icon={<FaServer />} isCollapsed={isCollapsed}>API Status</NavLink>
                <NavLink to="/dashboard/audience" icon={<FaChartBar />} isCollapsed={isCollapsed}>Audience</NavLink>
            </nav>
        </div>
    );

    return (
        <PrivateRoute>
            <div className="flex flex-1 overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 bg-slate-50">
                {/* Desktop Sidebar */}
                <aside className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`}>
                    {sidebarContent}
                </aside>

                {/* Mobile Sidebar */}
                <div className={`fixed inset-0 z-30 flex transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="w-64 flex flex-col flex-shrink-0">
                        <div className="flex justify-end p-2 bg-[#0f172a]">
                            <button onClick={() => setIsSidebarOpen(false)} className="text-2xl text-slate-400">
                                <FaTimes />
                            </button>
                        </div>
                        {sidebarContent}
                    </div>
                    <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto w-full relative">
                    <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Dashboard Menu</h2>
                        <button onClick={() => setIsSidebarOpen(true)} className="text-xl text-slate-600">
                            <FaBars />
                        </button>
                    </div>
                    <div className="min-h-screen">
                        {children}
                    </div>
                </main>
            </div>
        </PrivateRoute>
    );
};

export default DashboardLayout;