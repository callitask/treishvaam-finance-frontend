import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaSignOutAlt, FaUserCircle, FaBars, FaTimes, FaSearch, FaFacebookF, FaLinkedinIn, FaInstagram, FaCircle, FaMoon, FaSun } from 'react-icons/fa';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginDropdownOpen, setLoginDropdownOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [marketStatus, setMarketStatus] = useState({ isOpen: false, color: 'text-gray-400' });

    // NEW: State for sticky logo visibility
    const [showStickyLogo, setShowStickyLogo] = useState(false);
    const brandingRef = useRef(null);

    const { auth, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Market Status Logic
    useEffect(() => {
        const checkMarketStatus = () => {
            const now = new Date();
            const day = now.getUTCDay();
            const hour = now.getUTCHours();
            const minute = now.getUTCMinutes();
            const totalMinutes = hour * 60 + minute;
            const openTime = 13 * 60 + 30; // 13:30 UTC
            const closeTime = 20 * 60;     // 20:00 UTC
            const isWeekday = day >= 1 && day <= 5;
            const isOpen = isWeekday && totalMinutes >= openTime && totalMinutes < closeTime;
            setMarketStatus({
                isOpen: isOpen,
                color: isOpen ? 'text-green-600' : 'text-gray-400'
            });
        };
        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    // Scroll Logic (Mobile Header Hide/Show)
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                if (Math.abs(currentScrollY - lastScrollY) < 10) return;
                if (currentScrollY < 10) {
                    setIsVisible(true);
                } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
                setLastScrollY(currentScrollY);
            }
        };
        window.addEventListener('scroll', controlNavbar, { passive: true });
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    // Intersection Observer for Sticky Logo (Fixed for Build)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If main branding is NOT intersecting (scrolled away), show sticky logo
                setShowStickyLogo(!entry.isIntersecting);
            },
            {
                threshold: 0,
                // Offset top by 36px (Top Bar Height) so it triggers exactly when sliding under
                rootMargin: '-36px 0px 0px 0px'
            }
        );

        // Capture the current ref value to a variable to use in cleanup
        const currentBranding = brandingRef.current;

        if (currentBranding) {
            observer.observe(currentBranding);
        }

        return () => {
            if (currentBranding) {
                observer.unobserve(currentBranding);
            }
        };
    }, []);

    const getNavLinkClass = ({ isActive }) =>
        `text-xs font-bold uppercase tracking-widest px-6 py-3 border-b-2 transition-all duration-300 ${isActive
            ? 'border-sky-700 text-sky-700 dark:text-sky-400 dark:border-sky-400'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600'
        }`;

    return (
        <>
            {/* MOBILE HEADER */}
            <header className={`md:hidden fixed top-0 w-full z-[100] transition-transform duration-300 ease-out will-change-transform ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="absolute inset-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300"></div>
                <div className="relative flex items-center justify-between px-4 h-14">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-800 dark:text-slate-200 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors" aria-label="Open Menu">
                        <FaBars size={20} />
                    </button>
                    <Link to="/" className="flex items-center justify-center flex-1 mx-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-serif tracking-wide uppercase truncate">
                            TREISHVAAM FINANCE
                        </span>
                    </Link>

                    {/* Mobile Theme Toggle */}
                    <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors mr-1">
                        {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
                    </button>

                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-600 dark:text-slate-300 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors" aria-label="Search">
                        <FaSearch size={18} />
                    </button>
                </div>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[110] flex h-screen w-screen">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
                        <div className="relative w-[85%] max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900 safe-pt">
                                <span className="font-bold text-xl text-slate-900 dark:text-white font-serif">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 dark:text-gray-400 p-2 bg-white dark:bg-slate-800 rounded-full border dark:border-slate-700 shadow-sm active:scale-95 transition-transform">
                                    <FaTimes size={18} />
                                </button>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800"><SearchAutocomplete /></div>
                            <nav className="flex-1 overflow-y-auto py-2">
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800">Home</Link>
                                <Link to="/market/%5EDJI" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800">Markets</Link>
                                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800">About Us</Link>
                                <Link to="/vision" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800">Vision</Link>
                                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-6 py-4 text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800">Contact</Link>
                            </nav>
                            <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 safe-pb">
                                {auth.isAuthenticated ? (
                                    <div className="space-y-3">
                                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center w-full py-3 bg-sky-700 text-white rounded-xl font-bold shadow-md hover:bg-sky-800 transition-colors">Dashboard</Link>
                                        <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block text-center w-full py-2 text-red-600 font-semibold text-sm">Sign Out</button>
                                    </div>
                                ) : (
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">Admin Login</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* DESKTOP HEADER */}

            {/* 1. Spacer */}
            <div className="h-9 hidden md:block w-full"></div>

            {/* 2. Top Bar (Fixed) */}
            <div className="hidden md:flex fixed top-0 w-full z-[50] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs border-b border-gray-200 dark:border-slate-700 items-center">
                <div className="container mx-auto px-6 h-9 flex justify-between items-center">
                    <div className="flex items-center space-x-4 font-medium tracking-wide">
                        <span>{today}</span>
                        <span className="w-px h-3 bg-gray-300 dark:bg-gray-600"></span>
                        <div className="flex items-center gap-2">
                            <FaCircle className={`w-2 h-2 ${marketStatus.color}`} />
                            <span>{marketStatus.isOpen ? 'Market Open' : 'Market Closed'}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex space-x-4 border-r border-gray-300 dark:border-gray-600 pr-6">
                            <a href="https://linkedin.com/company/treishvaamfinance" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-[#0077b5] transition-colors"><FaLinkedinIn /></a>
                            <a href="https://facebook.com/treishvaamfinance" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-[#1877F3] transition-colors"><FaFacebookF /></a>
                            <a href="https://instagram.com/treishvaamfinance" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[#E1306C] transition-colors"><FaInstagram /></a>
                        </div>
                        <button onClick={toggleTheme} className="flex items-center gap-1.5 text-gray-500 hover:text-sky-700 dark:text-gray-400 dark:hover:text-sky-400 transition-colors" title="Toggle Theme">
                            {theme === 'dark' ? <FaSun className="text-amber-400" /> : <FaMoon />}
                        </button>
                        {auth.isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <Link to="/dashboard" className="font-bold text-gray-700 dark:text-gray-300 hover:text-sky-700">Dashboard</Link>
                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-600" title="Logout"><FaSignOutAlt /></button>
                            </div>
                        ) : (
                            <div className="relative" onMouseEnter={() => setLoginDropdownOpen(true)} onMouseLeave={() => setLoginDropdownOpen(false)}>
                                <button className="flex items-center font-bold text-gray-700 dark:text-gray-300 hover:text-sky-700 dark:hover:text-sky-400 transition uppercase tracking-wider text-[10px]">
                                    <FaUserCircle className="mr-1.5 text-sm text-gray-400" /> Sign In
                                </button>
                                {isLoginDropdownOpen && (
                                    <div className="absolute right-0 top-full pt-2 z-50">
                                        <div className="bg-white dark:bg-slate-800 rounded shadow-xl border border-gray-100 dark:border-slate-700 py-1 w-32">
                                            <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">Admin Login</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Branding (Scrolls, Observed) */}
            <div ref={brandingRef} className="hidden md:block bg-white dark:bg-slate-900 py-10 transition-colors duration-300">
                <div className="container mx-auto flex flex-col items-center justify-center">
                    <Link to="/" className="text-center group">
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white font-serif tracking-tight group-hover:opacity-90 transition-opacity">
                            TREISHVAAM FINANCE
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-[0.3em] uppercase mt-2 text-sky-800 dark:text-sky-400">
                            Market Intelligence & Analysis
                        </p>
                    </Link>
                </div>
            </div>

            {/* 4. Main Nav (Sticky, with Mini Logo) */}
            <div className="hidden md:block sticky top-9 z-[40] bg-white dark:bg-slate-900 border-y border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                <div className="container mx-auto px-6 relative">
                    <div className="flex justify-center items-center h-14">

                        {/* NEW: Sticky Left Branding (Horizontal & Same Size) */}
                        <Link
                            to="/"
                            className={`absolute left-6 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${showStickyLogo
                                ? 'opacity-100 pointer-events-auto translate-y-[-50%]'
                                : 'opacity-0 pointer-events-none translate-y-[-40%]'
                                }`}
                        >
                            <span className="font-black text-gray-900 dark:text-white font-serif tracking-tight text-xl uppercase">
                                TREISHVAAM FINANCE
                            </span>
                        </Link>

                        <nav className="flex space-x-1">
                            <NavLink to="/" className={getNavLinkClass} end>Home</NavLink>
                            {/* FIX: Route directly to Dow Jones (^DJI) instead of global */}
                            <NavLink to="/market/%5EDJI" className={getNavLinkClass}>Markets</NavLink>
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
        </>
    );
};

export default Navbar;