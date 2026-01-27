/**
 * AI-CONTEXT:
 * Purpose: Public Entry Point (Root "/").
 * Design: "Bloomberg/Reuters" Professional Style (Light Mode).
 * Features:
 * - Professional Stock Imagery (Finance/Architecture).
 * - "Smart" Widget Placement: Embedded in a realistic Dashboard Preview Card.
 * - Zero-Friction Auth (Socials + Brokers).
 * - Live Market Data (Ticker + Gainers).
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, getTopGainers } from '../apiConfig';
import {
    FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter,
    FaChartLine, FaArrowRight, FaGlobeAmericas, FaShieldAlt,
    FaSearchDollar, FaBuilding, FaArrowUp, FaArrowDown
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
                    setCategories(catRes.value.data ? catRes.value.data.slice(0, 12) : []);
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
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-900">

            {/* BACKGROUND GRAPHIC (Subtle) */}
            <div className="absolute top-0 right-0 w-[50%] h-[80vh] bg-gradient-to-bl from-slate-50 to-white -z-10 rounded-bl-[100px]"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] items-center gap-12 lg:gap-20 py-12">

                    {/* =======================
              LEFT COLUMN: ACTION
              ======================= */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center animate-fade-in-up">

                        {/* Trust Label */}
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-sky-500 inline-block mr-2 animate-pulse"></span>
                                Live Market Data
                            </span>
                        </div>

                        {/* Hero Heading */}
                        <h1 className="text-5xl sm:text-6xl font-serif font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Find your <br />
                            <span className="text-sky-700 relative">
                                Community
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-sky-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                            The professional network for modern traders. Institutional-grade data, expert analysis, and real-time signals in one platform.
                        </p>

                        {/* AUTH SECTION (Clean Grid) */}
                        <div className="mb-10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Start Trading With</p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <button onClick={handleLoginRedirect} className="h-12 flex items-center justify-center border border-slate-200 rounded-lg hover:border-sky-500 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white group">
                                    <FaGoogle className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={handleLoginRedirect} className="h-12 flex items-center justify-center border border-slate-200 rounded-lg hover:border-sky-500 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white group">
                                    <FaFacebookF className="text-blue-600 text-xl group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={handleLoginRedirect} className="h-12 flex items-center justify-center border border-slate-200 rounded-lg hover:border-sky-500 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white group">
                                    <FaLinkedinIn className="text-blue-700 text-xl group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={handleLoginRedirect} className="h-12 flex items-center justify-center border border-slate-200 rounded-lg hover:border-sky-500 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white group">
                                    <FaTwitter className="text-slate-900 text-xl group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-5 py-4 border border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-md transition-all bg-white group">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mr-3">
                                            <FaChartLine className="text-orange-500" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs text-slate-400 font-bold uppercase">Connect Broker</div>
                                            <div className="text-sm font-bold text-slate-800">Zerodha Kite</div>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-slate-300 group-hover:text-sky-600 transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Categories / Interests */}
                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <FaGlobeAmericas className="text-sky-600" /> Explore Interests
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {loading ? (
                                    <span className="text-sm text-slate-400">Loading topics...</span>
                                ) : (
                                    <>
                                        <Link to="/home" className="px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-bold rounded hover:bg-sky-100 transition-colors">#MarketNews</Link>
                                        {categories.map(cat => (
                                            <Link key={cat.id} to="/home" className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded hover:bg-slate-200 hover:text-slate-900 transition-colors">
                                                #{cat.name}
                                            </Link>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* =======================
              RIGHT COLUMN: VISUAL & WIDGETS
              ======================= */}
                    <div className="w-full lg:w-1/2 relative lg:h-[600px] flex items-center justify-center">

                        {/* 1. PROFESSIONAL BACKGROUND IMAGE (Unsplash Source) */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transform rotate-1 transition-transform hover:rotate-0 duration-700">
                            {/* Overlay Gradient for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=1000"
                                alt="Financial Dashboard Background"
                                className="w-full h-full object-cover"
                            />

                            {/* Caption on Image */}
                            <div className="absolute bottom-6 left-6 z-20 text-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <FaBuilding className="text-sky-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Global Markets</span>
                                </div>
                                <h3 className="text-2xl font-serif font-bold">Real-time Intelligence</h3>
                            </div>
                        </div>

                        {/* 2. "SMART PLACED" WIDGET CARD (Floating Dashboard) */}
                        <div className="relative z-30 w-[90%] -ml-12 lg:-ml-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/50 p-1 animate-float-slow">

                            {/* Fake Window Header */}
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between rounded-t-lg">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Treishvaam Terminal</div>
                            </div>

                            {/* WIDGET CONTENT */}
                            <div className="p-4 space-y-4">

                                {/* Widget A: Global Ticker (Wrapped & Working) */}
                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex justify-between">
                                        <span className="text-[10px] font-bold text-slate-500">INDICES</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    </div>
                                    {/* Pass mobileMode=true to remove fixed width constraints inside the widget */}
                                    <div className="h-[100px] overflow-hidden">
                                        <GlobalMarketTicker mobileMode={true} />
                                    </div>
                                </div>

                                {/* Widget B: Top Movers (Live Data List) */}
                                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                            <FaSearchDollar className="text-sky-600" /> Top Movers (24h)
                                        </span>
                                        <Link to="/home" className="text-[10px] text-sky-600 font-bold hover:underline">VIEW ALL</Link>
                                    </div>

                                    <div className="space-y-2">
                                        {loading ? (
                                            [...Array(3)].map((_, i) => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse"></div>)
                                        ) : marketMovers.length > 0 ? (
                                            marketMovers.map((mover, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800">{mover.ticker}</span>
                                                        <span className="text-[10px] text-slate-400">{mover.name ? mover.name.substring(0, 15) : ''}...</span>
                                                    </div>
                                                    <div className={`font-mono font-bold flex items-center ${mover.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {mover.changePercent >= 0 ? <FaArrowUp className="text-[10px] mr-1" /> : <FaArrowDown className="text-[10px] mr-1" />}
                                                        {Math.abs(mover.changePercent).toFixed(2)}%
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            // Fallback Data if API Empty
                                            <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-800">RELIANCE</span>
                                                    <span className="text-green-600 font-mono font-bold">+1.45%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-800">HDFCBANK</span>
                                                    <span className="text-red-600 font-mono font-bold">-0.32%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-800">TCS</span>
                                                    <span className="text-green-600 font-mono font-bold">+0.88%</span>
                                                </div>
                                            </>
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
          50% { transform: translateY(-8px); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
      `}</style>
        </div>
    );
};

export default LandingPage;