import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUserCircle, FaBars, FaTimes, FaSearch, FaFacebookF, FaLinkedinIn, FaInstagram, FaCircle } from 'react-icons/fa';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginDropdownOpen, setLoginDropdownOpen] = useState(false);

    // --- SMART SCROLL STATE ---
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [marketStatus, setMarketStatus] = useState({ isOpen: false, text: 'Closed' });

    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- MARKET STATUS LOGIC (UTC Check for US Market) ---
    useEffect(() => {
        const checkMarketStatus = () => {
            const now = new Date();
            const day = now.getUTCDay(); // 0=Sun, 6=Sat
            const hour = now.getUTCHours();
            const minute = now.getUTCMinutes();

            // US Market: 9:30 AM - 4:00 PM ET
            // UTC: Approx 13:30 - 20:00 (Standard) or 14:30 - 21:00 (DST)
            // Simplified logic: 13:30 UTC to 20:00 UTC Mon-Fri
            const totalMinutes = hour * 60 + minute;
            const openTime = 13 * 60 + 30; // 13:30
            const closeTime = 20 * 60;     // 20:00

            const isWeekday = day >= 1 && day <= 5;
            const isOpen = isWeekday && totalMinutes >= openTime && totalMinutes < closeTime;

            setMarketStatus({
                isOpen: isOpen,
                color: isOpen ? 'text-green-500' : 'text-gray-400'
            });
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    // --- SMART HEADER SCROLL LOGIC ---
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;

                if (currentScrollY < 10) {
                    setIsVisible(true); // Always show at top
                } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
                    setIsVisible(false); // Hide on scroll down
                } else {
                    setIsVisible(true); // Show on scroll up
                }
                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    const getNavLinkClass = ({ isActive }) =>
        `text-xs font-bold uppercase tracking-widest px-6 py-3 border-b-2 transition-all duration-300 ${isActive
            ? 'border-sky-600 text-sky-700'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`;

    return (
        <>
            {/* =========================================================================
               MOBILE HEADER (Smart Glass Architecture)
               ========================================================================= */}
            <header
                className={`md:hidden fixed top-0 w-full z-[100] transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
            >
                {/* Glass Layer */}
                <div className="absolute inset-0 bg-white/85 backdrop-blur-md border-b border-gray-200/50 shadow-sm"></div>

                <div className="relative flex items-center justify-between px-4 h-14">
                    {/* Left: Menu */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-800 active:scale-90 transition-transform"
                        aria-label="Menu"
                    >
                        <FaBars size={20} />
                    </button>

                    {/* Center: Branding + Status */}
                    <Link to="/" className="flex flex-col items-center" onClick={() => window.scrollTo(0, 0)}>
                        <span className="text-lg font-black text-gray-900 font-serif uppercase leading-none tracking-tight">
                            Treishvaam
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold text-sky-700 uppercase tracking-[0.2em] leading-none">
                                Finance
                            </span>
                            {/* Live Dot */}
                            <div className="flex items-center gap-1 bg-gray-100/50 px-1.5 py-0.5 rounded-full border border-gray-200/50">
                                <FaCircle className={`w-1.5 h-1.5 ${marketStatus.color} ${marketStatus.isOpen ? 'animate-pulse' : ''}`} />
                                <span className="text-[8px] font-semibold text-gray-500 uppercase tracking-tight">
                                    {marketStatus.isOpen ? 'LIVE' : 'CLOSED'}
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Right: Search */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-gray-600 active:scale-90 transition-transform"
                    >
                        <FaSearch size={18} />
                    </button>
                </div>

                {/* Mobile Drawer (Standard) */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[110] flex h-screen w-screen">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
                        <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 safe-pt">
                                <span className="font-bold text-xl text-gray-900 font-serif">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 p-2 bg-white rounded-full border shadow-sm active:scale-90 transition-transform"><FaTimes size={18} /></button>
                            </div>
                            <div className="p-4 bg-white border-b border-gray-100"><SearchAutocomplete /></div>
                            <nav className="flex-1 overflow-y-auto py-2">
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-semibold text-gray-800 hover:bg-gray-50 border-b border-gray-50 active:bg-gray-100">Home</Link>
                                <Link to="/market/global" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-semibold text-gray-800 hover:bg-gray-50 border-b border-gray-50 active:bg-gray-100">Markets</Link>
                                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-50 active:bg-gray-100">About Us</Link>
                                <Link to="/vision" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-50 active:bg-gray-100">Vision</Link>
                                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-50 active:bg-gray-100">Contact</Link>
                            </nav>
                            <div className="p-5 border-t border-gray-100 bg-gray-50 safe-pb">
                                {auth.isAuthenticated ? (
                                    <div className="space-y-3">
                                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center w-full py-3 bg-sky-600 text-white rounded-xl font-bold shadow-md hover:bg-sky-700 transition-colors">Dashboard</Link>
                                        <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block text-center w-full py-2 text-red-600 font-semibold text-sm">Sign Out</button>
                                    </div>
                                ) : (
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">Admin Login</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* DESKTOP MASTHEAD (Unchanged) */}
            <div className="hidden md:block bg-white font-sans">
                <div className="bg-gray-100 text-gray-500 text-xs border-b border-gray-200">
                    <div className="container mx-auto px-6 h-9 flex justify-between items-center">
                        <div className="flex items-center space-x-4 font-medium tracking-wide">
                            <span>{today}</span>
                            <span className="w-px h-3 bg-gray-300"></span>
                            <span>Bengaluru, IN</span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="flex space-x-4 border-r border-gray-300 pr-6">
                                <a href="https://linkedin.com/company/treishvaamfinance" target="_blank" rel="noreferrer" className="hover:text-[#0077b5]"><FaLinkedinIn /></a>
                                <a href="https://facebook.com/treishvaamfinance" target="_blank" rel="noreferrer" className="hover:text-[#1877F2]"><FaFacebookF /></a>
                                <a href="https://instagram.com/treishvaamfinance" target="_blank" rel="noreferrer" className="hover:text-[#E1306C]"><FaInstagram /></a>
                            </div>
                            {auth.isAuthenticated ? (
                                <div className="flex items-center space-x-3">
                                    <Link to="/dashboard" className="font-bold text-gray-700 hover:text-sky-600">Dashboard</Link>
                                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-600" title="Logout"><FaSignOutAlt /></button>
                                </div>
                            ) : (
                                <div className="relative" onMouseEnter={() => setLoginDropdownOpen(true)} onMouseLeave={() => setLoginDropdownOpen(false)}>
                                    <button className="flex items-center font-bold text-gray-700 hover:text-sky-600 transition uppercase tracking-wider text-[10px]">
                                        <FaUserCircle className="mr-1.5 text-sm text-gray-400" /> Sign In
                                    </button>
                                    {isLoginDropdownOpen && (
                                        <div className="absolute right-0 top-full pt-2 z-50">
                                            <div className="bg-white rounded shadow-xl border border-gray-100 py-1 w-32">
                                                <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Login</Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-white py-10">
                    <div className="container mx-auto flex flex-col items-center justify-center">
                        <Link to="/" className="text-center group">
                            <h1 className="text-5xl font-black text-gray-900 font-serif tracking-tight group-hover:opacity-90 transition-opacity">
                                TREISHVAAM FINANCE
                            </h1>
                            <p className="text-xs text-gray-500 font-bold tracking-[0.3em] uppercase mt-2 text-sky-700">
                                Market Intelligence & Analysis
                            </p>
                        </Link>
                    </div>
                </div>
                <div className="sticky top-0 z-50 bg-white border-y border-gray-200 shadow-sm">
                    <div className="container mx-auto px-6 relative">
                        <div className="flex justify-center items-center h-14">
                            <nav className="flex space-x-1">
                                <NavLink to="/" className={getNavLinkClass} end>Home</NavLink>
                                <NavLink to="/market/global" className={getNavLinkClass}>Markets</NavLink>
                                <NavLink to="/vision" className={getNavLinkClass}>Vision</NavLink>
                                <NavLink to="/about" className={getNavLinkClass}>About</NavLink>
                                <NavLink to="/contact" className={getNavLinkClass}>Contact</NavLink>
                            </nav>
                            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-64">
                                <SearchAutocomplete />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;