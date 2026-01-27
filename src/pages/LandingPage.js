/**
 * AI-CONTEXT:
 * Purpose: Public Entry Point (Root "/").
 * Design: "Davos-Grade" Community Center Landing Page.
 * Target: High-Net-Worth Individuals & Intellectuals.
 * Features:
 * - Ultra-Minimal "LinkedIn-Professional" Aesthetic.
 * - "Glassmorphic" Market Terminal with live widgets.
 * - Zero-Friction Auth (Socials + Brokers).
 * - CI Fix: Removed unused imports.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, getTopGainers } from '../apiConfig';
import {
    FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter,
    FaChartLine, FaArrowRight,
    FaSearchDollar, FaBuilding, FaArrowUp, FaArrowDown, FaLock
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
                    // Curate tags for "Intelligence" look
                    setCategories(catRes.value.data ? catRes.value.data.slice(0, 8) : []);
                }

                if (moverRes.status === 'fulfilled' && moverRes.value.data) {
                    setMarketMovers(moverRes.value.data.slice(0, 5));
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

            <div className="container mx-auto px-6 lg:px-12 h-screen flex flex-col justify-center">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* =======================
              LEFT COLUMN: THE COMMUNITY PROPOSITION
              ======================= */}
                    <div className="w-full lg:w-[45%] flex flex-col justify-center animate-fade-in-up order-2 lg:order-1">

                        {/* Exclusive Tag */}
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-[1px] bg-slate-400"></span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Global Community</span>
                        </div>

                        {/* Hero Heading - Serif for Authority */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-medium text-slate-900 leading-[1.05] mb-8 tracking-tight">
                            The Network for <br />
                            <span className="italic text-slate-500">Intelligent</span> Minds.
                        </h1>

                        <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-lg font-light">
                            Join a premier community of investors and thinkers. Share real-time market intelligence, proprietary data, and expert analysis in a distraction-free environment.
                        </p>

                        {/* COMMUNITY ACCESS CARD (Clean & Secure) */}
                        <div className="max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Community Access</p>
                                <FaLock className="text-slate-300 text-xs" />
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[
                                    { Icon: FaLinkedinIn, label: "LinkedIn", color: "text-[#0077b5]" },
                                    { Icon: FaGoogle, label: "Google", color: "text-red-600" },
                                    { Icon: FaTwitter, label: "X", color: "text-slate-900" },
                                    { Icon: FaFacebookF, label: "Facebook", color: "text-[#1877f2]" }
                                ].map((Btn, idx) => (
                                    <button
                                        key={idx}
                                        onClick={handleLoginRedirect}
                                        className="h-12 flex items-center justify-center bg-white border border-slate-200 rounded hover:border-slate-400 hover:shadow-sm transition-all"
                                        aria-label={`Sign in with ${Btn.label}`}
                                    >
                                        <Btn.Icon className={`${Btn.color} text-lg`} />
                                    </button>
                                ))}
                            </div>

                            {/* Broker Direct Access */}
                            <div className="space-y-3 mb-8">
                                <button onClick={handleLoginRedirect} className="w-full group flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                    <div className="flex items-center gap-3">
                                        <FaChartLine className="text-emerald-400" />
                                        <span className="text-sm font-medium tracking-wide">Connect Trading Account</span>
                                    </div>
                                    <FaArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </button>

                                <div className="text-center">
                                    <Link to="/home" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-wider border-b border-transparent hover:border-slate-900 pb-0.5">
                                        Explore Community (Guest)
                                    </Link>
                                </div>
                            </div>

                            {/* Intelligence Tags */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {loading ? (
                                    <span className="text-xs text-slate-300">Loading topics...</span>
                                ) : (
                                    categories.map(cat => (
                                        <Link key={cat.id} to="/home" className="text-xs font-medium text-slate-400 hover:text-sky-700 transition-colors">
                                            #{cat.name}
                                        </Link>
                                    ))
                                )}
                                <Link to="/home" className="text-xs font-bold text-slate-900">View All Topics &rarr;</Link>
                            </div>
                        </div>
                    </div>

                    {/* =======================
              RIGHT COLUMN: THE TERMINAL (Premium Visual)
              ======================= */}
                    <div className="w-full lg:w-[55%] relative h-[500px] lg:h-[700px] flex items-center justify-center order-1 lg:order-2">

                        {/* 1. Base Image (Architecture/Finance) - Grayscale/Subtle */}
                        <div className="absolute inset-0 rounded-tl-[100px] overflow-hidden opacity-90">
                            <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
                                alt="Financial District"
                                className="w-full h-full object-cover grayscale contrast-[1.1]"
                            />
                        </div>

                        {/* 2. "Glassmorphic" Terminal Card */}
                        <div className="relative z-20 w-[90%] max-w-lg bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-xl p-1 animate-float-slow">

                            {/* Header Bar */}
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
                            <div className="p-5 space-y-5">

                                {/* Widget: Market Ribbon */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Global Indices</span>
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden h-[80px]">
                                        <GlobalMarketTicker mobileMode={true} />
                                    </div>
                                </div>

                                {/* Widget: Top Movers Table */}
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
                                            marketMovers.map((mover, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-900 w-16">{mover.ticker}</span>
                                                        <span className="text-[10px] text-slate-500 truncate w-24 hidden sm:block">{mover.name}</span>
                                                    </div>
                                                    <div className={`text-xs font-mono font-medium flex items-center ${mover.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {mover.changePercent >= 0 ? '+' : ''}{mover.changePercent.toFixed(2)}%
                                                        {mover.changePercent >= 0 ? <FaArrowUp className="ml-1 text-[8px]" /> : <FaArrowDown className="ml-1 text-[8px]" />}
                                                    </div>
                                                </div>
                                            ))
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