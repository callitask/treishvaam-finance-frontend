import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <LazyLoadImage alt="Logo" effect="blur" src="/logo.png" className="h-12 w-12 mr-2" width="48" height="48" />
                            <span className="text-2xl font-bold header-logo-text">Treishvaam Finance</span>
                        </Link>
                        <nav className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <NavLink to="/" className={getLinkClass} end>Home</NavLink>
                                <NavLink to="/about" className={getLinkClass}>About</NavLink>
                                <NavLink to="/vision" className={getLinkClass}>Vision</NavLink>
                                <NavLink to="/education" className={getLinkClass}>Learn</NavLink>
                                <NavLink to="/blog" className={getLinkClass}>Blog</NavLink>
                                <NavLink to="/contact" className={getLinkClass}>Contact</NavLink>
                            </div>
                        </nav>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {auth.isAuthenticated ? (
                                <NavLink to="/dashboard" className={getLinkClass}>Dashboard</NavLink>
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

                {/* Mobile menu, show/hide based on menu state. */}
                {isMobileMenuOpen && (
                    <div className="md:hidden" id="mobile-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavLink to="/" className={getMobileLinkClass} onClick={closeMobileMenu} end>Home</NavLink>
                            <NavLink to="/about" className={getMobileLinkClass} onClick={closeMobileMenu}>About</NavLink>
                            <NavLink to="/vision" className={getMobileLinkClass} onClick={closeMobileMenu}>Vision</NavLink>
                            <NavLink to="/education" className={getMobileLinkClass} onClick={closeMobileMenu}>Learn</NavLink>
                            <NavLink to="/blog" className={getMobileLinkClass} onClick={closeMobileMenu}>Blog</NavLink>
                            <NavLink to="/contact" className={getMobileLinkClass} onClick={closeMobileMenu}>Contact</NavLink>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="px-2 space-y-1">
                                {auth.isAuthenticated ? (
                                    <NavLink to="/dashboard" className={getMobileLinkClass} onClick={closeMobileMenu}>Dashboard</NavLink>
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