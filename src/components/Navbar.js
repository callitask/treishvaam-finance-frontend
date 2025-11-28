import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUserCircle, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginDropdownOpen, setLoginDropdownOpen] = useState(false);
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavLinkClass = ({ isActive }) =>
        `text-sm font-bold uppercase tracking-wider px-4 py-3 border-b-2 transition-colors duration-200 ${isActive
            ? 'border-sky-600 text-sky-700'
            : 'border-transparent text-gray-600 hover:text-sky-600 hover:border-gray-200'
        }`;

    return (
        <>
            {/* --- MOBILE ENTERPRISE HEADER --- */}
            <header className="md:hidden bg-white/95 backdrop-blur-sm sticky top-0 z-[100] border-b border-gray-200 shadow-sm safe-pt transition-all duration-300">
                <div className="flex items-center justify-between px-4 h-14">

                    {/* Left: Menu Trigger */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-800 rounded-full active:bg-gray-100 transition-colors"
                        aria-label="Menu"
                    >
                        <FaBars size={20} />
                    </button>

                    {/* Center: BRANDING (Requested Full Name) */}
                    <Link to="/" className="flex items-center gap-2" onClick={() => window.scrollTo(0, 0)}>
                        <img src="/logo.webp" alt="Logo" className="h-7 w-7 object-contain" />
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[13px] font-black text-gray-900 tracking-tight font-serif uppercase">
                                TREISHVAAM FINANCE
                            </span>
                        </div>
                    </Link>

                    {/* Right: Search */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-gray-600 hover:text-sky-700 active:bg-gray-100 rounded-full"
                    >
                        <FaSearch size={18} />
                    </button>
                </div>

                {/* Mobile Drawer Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[110] flex">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
                        <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                            {/* Drawer Header */}
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 safe-pt">
                                <span className="font-bold text-xl text-gray-900 font-serif">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 p-1 bg-white rounded-full border shadow-sm">
                                    <FaTimes size={18} />
                                </button>
                            </div>

                            {/* Search inside Drawer */}
                            <div className="p-4 bg-white">
                                <SearchAutocomplete />
                            </div>

                            {/* Nav Links */}
                            <nav className="flex-1 overflow-y-auto py-2">
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-semibold text-gray-800 hover:bg-gray-50 border-b border-gray-50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-3"></span> Home
                                </Link>
                                <Link to="/market/global" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-semibold text-gray-800 hover:bg-gray-50 border-b border-gray-50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-3"></span> Markets
                                </Link>
                                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-50">
                                    About Us
                                </Link>
                                <Link to="/vision" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-50">
                                    Vision
                                </Link>
                                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-50">
                                    Contact
                                </Link>
                            </nav>

                            {/* Footer / Auth */}
                            <div className="p-5 border-t border-gray-100 bg-gray-50 safe-pb">
                                {auth.isAuthenticated ? (
                                    <div className="space-y-3">
                                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center w-full py-3 bg-sky-600 text-white rounded-xl font-bold shadow-md hover:bg-sky-700 transition-colors">
                                            Dashboard
                                        </Link>
                                        <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block text-center w-full py-2 text-red-600 font-semibold text-sm">
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-md">
                                        Admin Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* --- DESKTOP NAVBAR (Hidden on Mobile) --- */}
            <div className="hidden md:block bg-white shadow-sm sticky top-0 z-50 font-sans">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">
                    <div className="w-1/3 text-xs text-gray-500 font-medium flex flex-col justify-center">
                        <span className="uppercase tracking-widest text-gray-400 mb-0.5">Bangalore</span>
                        <span className="text-gray-700 font-bold">{today}</span>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center">
                        <Link to="/" className="flex items-center group">
                            <img alt="Logo" src="/logo.webp" className="h-10 w-auto mr-2 transition-transform duration-300 group-hover:scale-105" />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none font-serif">
                                    TREISHVAAM <span className="text-sky-700">FINANCE</span>
                                </span>
                            </div>
                        </Link>
                    </div>
                    <div className="w-1/3 flex justify-end items-center space-x-4">
                        <div className="w-64"><SearchAutocomplete /></div>
                        <div className="relative">
                            {auth.isAuthenticated ? (
                                <div className="flex items-center space-x-3">
                                    <NavLink to="/dashboard" className="text-sm font-semibold text-gray-700 hover:text-sky-600 transition">Dashboard</NavLink>
                                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition" title="Logout"><FaSignOutAlt size={18} /></button>
                                </div>
                            ) : (
                                <div className="relative" onMouseEnter={() => setLoginDropdownOpen(true)} onMouseLeave={() => setLoginDropdownOpen(false)}>
                                    <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-sky-600 transition"><FaUserCircle className="mr-1.5 text-lg text-gray-400" />Login</button>
                                    {isLoginDropdownOpen && (
                                        <div className="absolute right-0 mt-0 w-40 pt-2">
                                            <div className="bg-white rounded-md shadow-xl border border-gray-100 py-1">
                                                <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700">Admin Login</Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 border-b-4 border-double border-gray-100">
                    <div className="container mx-auto flex justify-center">
                        <nav className="flex space-x-8">
                            <NavLink to="/" className={getNavLinkClass} end>Home</NavLink>
                            <NavLink to="/about" className={getNavLinkClass}>About</NavLink>
                            <NavLink to="/vision" className={getNavLinkClass}>Vision</NavLink>
                            <NavLink to="/contact" className={getNavLinkClass}>Contact</NavLink>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;