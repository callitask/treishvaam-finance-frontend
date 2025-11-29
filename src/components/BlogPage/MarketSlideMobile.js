// src/components/BlogPage/MarketSlideMobile.js
import React, { useState } from 'react';
import { getMostActive, getTopGainers, getTopLosers } from '../../apiConfig';
import GlobalMarketTicker from '../market/GlobalMarketTicker';
import TopMoversCard from '../market/TopMoversCard';
import IndexCharts from '../market/IndexCharts';
import { WatchlistSidebar } from '../market/WatchlistSidebar'; // <--- Import Watchlist

const MarketSlideMobile = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'watchlist', 'movers'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 w-full transition-colors duration-300">

            {/* 1. Header & Tabs */}
            <div className="sticky top-14 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-emerald-500 rounded-sm"></span>
                        Market Data
                    </h2>
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Indices
                        </button>
                        <button
                            onClick={() => setActiveTab('watchlist')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'watchlist' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Watchlist
                        </button>
                        <button
                            onClick={() => setActiveTab('movers')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'movers' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Movers
                        </button>
                    </div>
                </div>

                {/* 2. Global Ticker Tape */}
                <div className="border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                    <GlobalMarketTicker mobileMode={true} />
                </div>
            </div>

            {/* 3. Main Content Area */}
            <div className="p-4 space-y-6">

                {/* VIEW A: OVERVIEW (Indices) */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Global Indices</h3>
                                <span className="text-[10px] text-gray-400">Live Updates</span>
                            </div>
                            <div className="p-2">
                                <IndexCharts />
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-center">
                            <h4 className="text-blue-900 dark:text-blue-300 font-bold text-sm mb-1">Looking for specific stocks?</h4>
                            <p className="text-blue-700 dark:text-blue-400 text-xs mb-3">Use the search bar in the menu to find detailed quotes.</p>
                        </div>
                    </div>
                )}

                {/* VIEW B: WATCHLIST (New) */}
                {activeTab === 'watchlist' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <WatchlistSidebar />
                    </div>
                )}

                {/* VIEW C: MOVERS (Gainers/Losers) */}
                {activeTab === 'movers' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <TopMoversCard title="Most Active" fetchData={getMostActive} type="active" />
                        <TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" />
                        <TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" />
                    </div>
                )}

            </div>
        </div>
    );
};

export default MarketSlideMobile;