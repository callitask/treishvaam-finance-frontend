import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logoSrc, setLogoSrc] = useState('/api/logo');
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLogoError = () => {
        setLogoSrc('/logo.png');
    };

    const getLinkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive
                ? 'bg-sky-100 text-sky-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`;

    const getMobileLinkClass = ({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
            isActive
                ? 'bg-sky-100 text-sky-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`;

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[80px]">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img
                                alt="Treishvaam Finance Logo"
                                src={logoSrc}
                                onError={handleLogoError}
                                className="h-12 w-auto mr-3"
                                width="48"
                                height="48"
                            />
                            <span className="text-2xl font-bold header-logo-text">Treishvaam Finance</span>
                        </Link>
                        <nav className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <NavLink to="/" className={getLinkClass} end>Home</NavLink>
                                <NavLink to="/about" className={getLinkClass}>About</NavLink>
                                <NavLink to="/vision" className={getLinkClass}>Vision</NavLink>
                                <NavLink to="/contact" className={getLinkClass}>Contact</NavLink>
                                {auth.isAuthenticated && (
                                    <NavLink to="/dashboard" className={getLinkClass}>Dashboard</NavLink>
                                )}
                            </div>
                        </nav>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {auth.isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-300 flex items-center"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Logout
                                </button>
                            ) : (
                                <Link to="/login" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white cta-button-primary hover:bg-sky-700 transition duration-300">Login</Link>
                            )}
                        </div>
                    </div>
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} type="button" className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden" id="mobile-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavLink to="/" className={getMobileLinkClass} onClick={closeMobileMenu} end>Home</NavLink>
                            <NavLink to="/about" className={getMobileLinkClass} onClick={closeMobileMenu}>About</NavLink>
                            <NavLink to="/vision" className={getMobileLinkClass} onClick={closeMobileMenu}>Vision</NavLink>
                            <NavLink to="/education" className={getMobileLinkClass} onClick={closeMobileMenu}>Learn</NavLink>
                            {/* --- MODIFICATION START: Added missing '=' sign --- */}
                            <NavLink to="/blog" className={getMobileLinkClass} onClick={closeMobileMenu}>Blog</NavLink>
                            {/* --- MODIFICATION END --- */}
                            <NavLink to="/contact" className={getMobileLinkClass} onClick={closeMobileMenu}>Contact</NavLink>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="px-2 space-y-1">
                                {auth.isAuthenticated ? (
                                    <>
                                        <NavLink to="/dashboard" className={getMobileLinkClass} onClick={closeMobileMenu}>Dashboard</NavLink>
                                        <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700">Logout</button>
                                    </>
                                ) : (
                                    <Link to="/login" className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white cta-button-primary hover:bg-sky-700" onClick={closeMobileMenu}>Login</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;