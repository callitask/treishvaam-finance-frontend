import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginDropdownOpen, setLoginDropdownOpen] = useState(false);
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    // Format today's date for the "News" feel (e.g., "Sunday, Nov 23, 2025")
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Styles for the bottom nav bar links
    const getNavLinkClass = ({ isActive }) =>
        `text-sm font-bold uppercase tracking-wider px-4 py-3 border-b-2 transition-colors duration-200 ${isActive
            ? 'border-sky-600 text-sky-700'
            : 'border-transparent text-gray-600 hover:text-sky-600 hover:border-gray-200'
        }`;

    const getMobileLinkClass = ({ isActive }) =>
        `block px-4 py-2 text-base font-medium transition-colors duration-200 ${isActive
            ? 'bg-sky-50 text-sky-700 border-l-4 border-sky-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`;

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 font-sans">
            {/* --- DESKTOP LAYOUT --- */}
            <div className="hidden md:block">
                {/* Row 1: Utility, Date, Brand, Search */}
                <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">

                    {/* Left: Date & Tagline */}
                    <div className="w-1/3 text-xs text-gray-500 font-medium flex flex-col justify-center">
                        <span className="uppercase tracking-widest text-gray-400 mb-0.5">Bangalore</span>
                        <span className="text-gray-700 font-bold">{today}</span>
                    </div>

                    {/* Center: BRANDING (Absolute Center) */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center">
                        <Link to="/" className="flex items-center group">
                            <img
                                alt="Treishvaam Finance Logo"
                                src="/logo.webp"
                                className="h-10 w-auto mr-2 transition-transform duration-300 group-hover:scale-105"
                                width="85"
                                height="40"
                            />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none font-serif">
                                    TREISHVAAM <span className="text-sky-700">FINANCE</span>
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Search & Auth */}
                    <div className="w-1/3 flex justify-end items-center space-x-4">
                        <div className="w-64">
                            <SearchAutocomplete />
                        </div>

                        {/* Login / Dashboard */}
                        <div className="relative">
                            {auth.isAuthenticated ? (
                                <div className="flex items-center space-x-3">
                                    <NavLink to="/dashboard" className="text-sm font-semibold text-gray-700 hover:text-sky-600 transition">
                                        Dashboard
                                    </NavLink>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-red-600 transition"
                                        title="Logout"
                                    >
                                        <FaSignOutAlt size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative"
                                    onMouseEnter={() => setLoginDropdownOpen(true)}
                                    onMouseLeave={() => setLoginDropdownOpen(false)}>
                                    <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-sky-600 transition">
                                        <FaUserCircle className="mr-1.5 text-lg text-gray-400" />
                                        Login
                                    </button>
                                    {isLoginDropdownOpen && (
                                        <div className="absolute right-0 mt-0 w-40 pt-2">
                                            <div className="bg-white rounded-md shadow-xl border border-gray-100 py-1">
                                                <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700">
                                                    Admin Login
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Navigation Bar (Centered) */}
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

            {/* --- MOBILE LAYOUT --- */}
            <div className="md:hidden">
                <div className="px-4 h-16 flex items-center justify-between border-b border-gray-200 bg-white relative">

                    {/* Left: Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-600 p-2 -ml-2 hover:bg-gray-100 rounded-md focus:outline-none"
                        aria-label="Toggle mobile menu" // ACCESSIBILITY FIX
                    >
                        {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
                    </button>

                    {/* Center: Branding */}
                    <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
                        <img src="/logo.webp" alt="Logo" className="h-8 w-auto mr-2" />
                        <span className="text-lg font-bold text-gray-900 font-serif">
                            Treishvaam
                        </span>
                    </Link>

                    {/* Right: Date or Empty for balance */}
                    <div className="text-[10px] text-gray-400 font-medium w-8 text-right">
                        {/* Optional: Short date or icon */}
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="bg-white border-b border-gray-200 shadow-lg">
                        <div className="p-4 border-b border-gray-100">
                            <SearchAutocomplete />
                        </div>
                        <nav className="py-2">
                            <NavLink to="/" className={getMobileLinkClass} onClick={closeMobileMenu} end>Home</NavLink>
                            <NavLink to="/about" className={getMobileLinkClass} onClick={closeMobileMenu}>About</NavLink>
                            <NavLink to="/vision" className={getMobileLinkClass} onClick={closeMobileMenu}>Vision</NavLink>
                            <NavLink to="/contact" className={getMobileLinkClass} onClick={closeMobileMenu}>Contact</NavLink>

                            <div className="border-t border-gray-100 my-2 pt-2">
                                {auth.isAuthenticated ? (
                                    <>
                                        <NavLink to="/dashboard" className={getMobileLinkClass} onClick={closeMobileMenu}>Dashboard</NavLink>
                                        <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="block px-4 py-2 text-base font-medium text-sky-700 hover:bg-sky-50" onClick={closeMobileMenu}>
                                        Admin Login
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;