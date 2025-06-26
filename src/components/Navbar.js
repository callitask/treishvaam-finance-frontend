import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const getNavLinkClass = ({ isActive }) => `nav-link-hover transition duration-300 ${isActive ? 'nav-link-active' : ''}`;
    const getMobileNavLinkClass = ({ isActive }) => `block px-6 py-3 text-gray-700 mobile-nav-link-hover transition duration-300 ${isActive ? 'mobile-nav-link-active' : ''}`;

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <NavLink to="/" className="flex items-center">
              <LazyLoadImage alt="Logo" effect="blur" src="/logo.png" className="h-10 md:h-12 mr-2" />
              <span className="text-2xl font-bold header-logo-text">Treishvaam Finance</span>
            </NavLink>
            <nav className="hidden md:flex space-x-6 items-center">
              <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
              <NavLink to="/about" className={getNavLinkClass}>About Us</NavLink>
              <NavLink to="/vision" className={getNavLinkClass}>Our Vision</NavLink>
              <NavLink to="/education" className={getNavLinkClass}>Education</NavLink>
              <NavLink to="/blog" className={getNavLinkClass}>Blog</NavLink>
              <NavLink to="/contact" className={getNavLinkClass}>Contact</NavLink>
              {token ? (
                   <>
                      <NavLink to="/dashboard" className={getNavLinkClass}>Dashboard</NavLink>
                      <button onClick={handleLogout} className="action-button text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">Logout</button>
                   </>
              ) : (
                   <NavLink to="/login" className="action-button text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">Login</NavLink>
              )}
            </nav>
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 nav-link-hover focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
            </div>
          </div>
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-white shadow-lg`}>
            <NavLink to="/" className={getMobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={getMobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
            <NavLink to="/vision" className={getMobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Our Vision</NavLink>
            <NavLink to="/education" className={getMobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Education</NavLink>
            <NavLink to="/blog" className={getMobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Blog</NavLink>
            <NavLink to="/contact" className={getMobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Contact</NavLink>
             {token ? (
                <>
                  <NavLink to="/dashboard" className={getMobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
                  <button onClick={handleLogout} className="block w-full text-left mx-4 my-3 action-button text-white text-center font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">Logout</button>
                </>
             ) : (
                <NavLink to="/login" className="block mx-4 my-3 action-button text-white text-center font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300" onClick={() => setMobileMenuOpen(false)}>Login</NavLink>
             )}
          </div>
        </header>
    );
};
export default Navbar;
