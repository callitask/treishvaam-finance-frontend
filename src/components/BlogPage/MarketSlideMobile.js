import React, { useState } from 'react';
import { getMostActive, getTopGainers, getTopLosers } from '../../apiConfig';
import GlobalMarketTicker from '../market/GlobalMarketTicker';
import TopMoversCard from '../market/TopMoversCard';
import IndexCharts from '../market/IndexCharts';

const MarketSlideMobile = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'movers'

    return (
        <div className="min-h-screen bg-slate-50 pb-24 w-full">

            {/* 1. Header & Tabs */}
            <div className="sticky top-14 z-20 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-emerald-500 rounded-sm"></span>
                        Market Data
                    </h2>
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'overview' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            Indices
                        </button>
                        <button
                            onClick={() => setActiveTab('movers')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'movers' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            Movers
                        </button>
                    </div>
                </div>

                {/* 2. Global Ticker Tape (Sticky context) */}
                <div className="border-t border-gray-100 bg-gray-50/50">
                    <GlobalMarketTicker />
                </div>
            </div>

            {/* 3. Main Content Area */}
            <div className="p-4 space-y-6">

                {/* VIEW A: OVERVIEW (Indices) */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Global Indices</h3>
                                <span className="text-[10px] text-gray-400">Live Updates</span>
                            </div>
                            {/* Reusing existing logic but containerized for mobile */}
                            <div className="p-2">
                                <IndexCharts />
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                            <h4 className="text-blue-900 font-bold text-sm mb-1">Looking for specific stocks?</h4>
                            <p className="text-blue-700 text-xs mb-3">Use the search bar in the menu to find detailed quotes for thousands of global assets.</p>
                        </div>
                    </div>
                )}

                {/* VIEW B: MOVERS (Gainers/Losers) */}
                {activeTab === 'movers' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* High density cards */}
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