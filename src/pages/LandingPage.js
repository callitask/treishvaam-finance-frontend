/**
 * AI-CONTEXT:
 * Purpose: Public Entry Point (Root "/").
 * Design: "Davos-Grade" Institutional Financial Landing Page.
 * Target: High-Net-Worth Individuals & Intellectuals.
 * Features:
 * - Refined "Explore Community" Auth Container.
 * - "Access Platform" professional bypass link.
 * - Widget Fix: Adjusted container heights for Global Ticker.
 * - New "Market Focus" Button Section.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, getTopGainers } from '../apiConfig';
import {
    FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter,
    FaChartLine, FaArrowRight,
    FaSearchDollar, FaBuilding, FaArrowUp, FaArrowDown, FaLock, FaGlobe
} from 'react-icons/fa';
import GlobalMarketTicker from '../components/market/GlobalMarketTicker';

const LandingPage = () => {
    const [categories, setCategories] = useState([]);
    const [marketMovers, setMarketMovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch Dynamic Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, moverRes] = await Promise.allSettled([
                    getCategories(),
                    getTopGainers()
                ]);

                if (catRes.status === 'fulfilled') {
                    // Fetch diverse tags for the button section
                    setCategories(catRes.value.data ? catRes.value.data.slice(0, 10) : []);
                }

                if (moverRes.status === 'fulfilled' && moverRes.value.data) {
                    setMarketMovers(moverRes.value.data.slice(0, 4)); // Reduced to 4 to prevent crowding
                }
            } catch (error) {
                console.error("Landing data fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">

            {/* GLOBAL BACKGROUND: Subtle "Premium Paper" Texture */}
            <div className="fixed inset-0 bg-[#fafafa] -z-20"></div>
            <div className="fixed top-0 right-0 w-[60%] h-full bg-white -z-10 skew-x-12 translate-x-20 shadow-[-50px_0_100px_rgba(0,0,0,0.02)] hidden lg:block"></div>

            <div className="container mx-auto px-6 lg:px-12 min-h-screen flex flex-col justify-center py-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* =======================
              LEFT COLUMN: THE PROPOSITION
              ======================= */}
                    <div className="w-full lg:w-[45%] flex flex-col justify-center animate-fade-in-up order-2 lg:order-1">

                        {/* Exclusive Tag */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-[1px] bg-slate-400"></span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Global Network</span>
                        </div>

                        {/* Hero Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-medium text-slate-900 leading-[1.05] mb-6 tracking-tight">
                            The Network for <br />
                            <span className="italic text-slate-500">Intelligent</span> Capital.
                        </h1>

                        <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg font-light">
                            Join a premier community of investors and thinkers. Share real-time market intelligence, proprietary data, and expert analysis in a distraction-free environment.
                        </p>

                        {/* NEW: "EXPLORE COMMUNITY" AUTH CONTAINER (Bordered & Refined) */}
                        <div className="max-w-md w-full">

                            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow mb-6">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <FaLock className="text-slate-300" /> Explore Community
                                    </h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">OPEN ACCESS</span>
                                </div>

                                {/* Social Grid */}
                                <div className="grid grid-cols-4 gap-3 mb-5">
                                    {[
                                        { Icon: FaLinkedinIn, label: "LinkedIn", color: "text-[#0077b5]" },
                                        { Icon: FaGoogle, label: "Google", color: "text-red-600" },
                                        { Icon: FaTwitter, label: "X", color: "text-slate-900" },
                                        { Icon: FaFacebookF, label: "Facebook", color: "text-[#1877f2]" }
                                    ].map((Btn, idx) => (
                                        <button
                                            key={idx}
                                            onClick={handleLoginRedirect}
                                            className="h-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded hover:bg-white hover:border-slate-400 transition-all"
                                            aria-label={`Sign in with ${Btn.label}`}
                                        >
                                            <Btn.Icon className={`${Btn.color} text-lg`} />
                                        </button>
                                    ))}
                                </div>

                                {/* Broker Connect */}
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50 group">
                                    <div className="flex items-center gap-3">
                                        <FaChartLine className="text-emerald-400" />
                                        <span className="text-xs font-bold tracking-wide uppercase">Connect Trading Account</span>
                                    </div>
                                    <FaArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>

                            {/* "CONTINUE" LINK (Outside & Professional) */}
                            <div className="flex items-center justify-between px-2">
                                <Link
                                    to="/home"
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-700 transition-colors group"
                                >
                                    Access Market Platform
                                    <span className="w-4 h-[1px] bg-slate-300 group-hover:w-8 group-hover:bg-sky-700 transition-all"></span>
                                </Link>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Account Required</span>
                            </div>

                        </div>

                        {/* NEW SECTION: MARKET FOCUS BUTTONS */}
                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FaGlobe className="text-slate-300" /> Market Focus
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {loading ? (
                                    <span className="text-xs text-slate-300">Loading sectors...</span>
                                ) : (
                                    <>
                                        {/* Static Key Topics */}
                                        <Link to="/home" className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                                            Macro Strategy
                                        </Link>
                                        {/* Dynamic Topics */}
                                        {categories.map(cat => (
                                            <Link
                                                key={cat.id}
                                                to="/home"
                                                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-500 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all shadow-sm"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                        <Link to="/home" className="px-4 py-2 rounded-full border border-transparent text-xs font-bold text-sky-700 hover:underline">
                                            View All &rarr;
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* =======================
              RIGHT COLUMN: THE TERMINAL (Refined Widget Spacing)
              ======================= */}
                    <div className="w-full lg:w-[55%] relative h-[500px] lg:h-[700px] flex items-center justify-center order-1 lg:order-2">

                        {/* 1. Base Image */}
                        <div className="absolute inset-0 rounded-tl-[100px] overflow-hidden opacity-90">
                            <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
                                alt="Financial District"
                                className="w-full h-full object-cover grayscale contrast-[1.1]"
                            />
                        </div>

                        {/* 2. Terminal Card */}
                        <div className="relative z-20 w-[95%] max-w-lg bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-xl p-1 animate-float-slow">

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white/50 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <FaBuilding className="text-slate-400 text-xs" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Treishvaam Terminal</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 space-y-6"> {/* Increased vertical spacing */}

                                {/* Widget: Market Ribbon (FIXED HEIGHT) */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Global Indices</span>
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    </div>
                                    {/* Increased min-height to prevent clipping of internal 90px component */}
                                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden h-[100px]">
                                        <GlobalMarketTicker mobileMode={true} />
                                    </div>
                                </div>

                                {/* Widget: Top Movers Table (FIXED BUG & SPACING) */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-900 uppercase flex items-center gap-2">
                                            <FaSearchDollar /> Market Movers
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">LIVE</span>
                                    </div>

                                    <div className="space-y-0">
                                        {loading ? (
                                            [1, 2, 3].map(i => <div key={i} className="h-8 border-b border-slate-50 animate-pulse bg-slate-50"></div>)
                                        ) : marketMovers.length > 0 ? (
                                            marketMovers.map((mover, idx) => {
                                                // Robust Parsing for Widget Data
                                                let changeVal = 0;
                                                const rawChange = mover.changePercent !== undefined ? mover.changePercent : mover.changePercentage;

                                                if (typeof rawChange === 'number') {
                                                    changeVal = rawChange;
                                                } else if (typeof rawChange === 'string') {
                                                    changeVal = parseFloat(rawChange.replace(/[%+]/g, '')) || 0;
                                                }

                                                return (
                                                    <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-slate-900 w-16">{mover.ticker}</span>
                                                            <span className="text-[10px] text-slate-500 truncate w-24 hidden sm:block">{mover.name}</span>
                                                        </div>
                                                        <div className={`text-xs font-mono font-medium flex items-center ${changeVal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {changeVal >= 0 ? '+' : ''}{changeVal.toFixed(2)}%
                                                            {changeVal >= 0 ? <FaArrowUp className="ml-1 text-[8px]" /> : <FaArrowDown className="ml-1 text-[8px]" />}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // High-End Fallback Visual
                                            [
                                                { t: 'NVDA', n: 'NVIDIA Corp', c: 2.45 },
                                                { t: 'AAPL', n: 'Apple Inc', c: -0.45 },
                                                { t: 'MSFT', n: 'Microsoft', c: 0.82 }
                                            ].map((m, i) => (
                                                <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-900 w-16">{m.t}</span>
                                                        <span className="text-[10px] text-slate-500 hidden sm:block">{m.n}</span>
                                                    </div>
                                                    <div className={`text-xs font-mono font-medium flex items-center ${m.c >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {m.c > 0 ? '+' : ''}{m.c}%
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
      `}</style>
        </div>
    );
};

export default LandingPage;