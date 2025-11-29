// src/components/BlogPage/MarketSidebar.js
import React from 'react';
import IndexCharts from '../market/IndexCharts';
import MarketMovers from '../market/MarketMovers';
import { WatchlistSidebar } from '../market/WatchlistSidebar'; // <--- FIXED IMPORT

const MarketSidebar = () => {
    return (
        <div className="space-y-8">
            {/* Widget 0: Personal Watchlist */}
            <WatchlistSidebar />

            {/* Widget 1: Global Indices */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-sky-600"></span>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                        Market Pulse
                    </h2>
                </div>
                <IndexCharts />
            </section>

            {/* Widget 2: Movers & Shakers */}
            <section>
                <div className="flex items-center gap-2 mb-4 mt-8">
                    <span className="w-1 h-4 bg-amber-500"></span>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                        Top Movers
                    </h2>
                </div>
                <MarketMovers />
            </section>

            {/* Widget 3: Static Ad / CTA */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 text-center text-white shadow-lg">
                <h3 className="font-serif text-xl font-bold mb-2">Master the Markets</h3>
                <p className="text-slate-300 text-sm mb-4">Get exclusive insights and daily analysis delivered to your inbox.</p>
                <button className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-widest transition-colors w-full">
                    Subscribe Now
                </button>
            </div>
        </div>
    );
};

export default MarketSidebar;