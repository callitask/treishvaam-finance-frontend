import React from 'react';
import Slider from "react-slick";
import TopMoversCard from '../market/TopMoversCard';
import { getMostActive, getTopGainers, getTopLosers } from '../../apiConfig';
import IndexCharts from '../market/IndexCharts';
import GlobalMarketTicker from '../market/GlobalMarketTicker';

const MarketSlideMobile = () => {
    // UPDATED SETTINGS:
    // 1. dots: false -> REMOVES the "123" pagination numbers
    // 2. infinite: false -> Prevents scrolling loop glitches
    const marketSliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1.05, // Slight peek of next card
        slidesToScroll: 1,
        arrows: false,
        className: "pb-4",
    };

    return (
        // Added 'w-full overflow-x-hidden' to prevent page zooming/wobble
        <div className="bg-gray-50 min-h-screen pb-24 w-full overflow-x-hidden">

            {/* Header */}
            <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Market Terminal</h2>
                <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-green-700">LIVE</span>
                </div>
            </div>

            {/* Ticker Tape */}
            <div className="bg-white border-b border-gray-200 mb-4">
                <GlobalMarketTicker />
            </div>

            <div className="space-y-6">

                {/* Section 1: Indices Chart */}
                <section className="bg-white py-4 border-y border-gray-200 shadow-sm">
                    <div className="px-4 mb-3 flex items-center gap-2">
                        <span className="w-1 h-3 bg-sky-600 rounded-full"></span>
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Global Indices</h3>
                    </div>
                    <div className="px-2">
                        <IndexCharts />
                    </div>
                </section>

                {/* Section 2: Movers Deck (Swipeable Widgets) */}
                <section className="overflow-hidden">
                    <div className="px-4 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-3 bg-amber-500 rounded-full"></span>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Top Movers</h3>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Swipe cards →</span>
                    </div>

                    <div className="pl-4 w-full">
                        <Slider {...marketSliderSettings}>
                            <div className="pr-3 outline-none">
                                <TopMoversCard title="Most Active" fetchData={getMostActive} type="active" />
                            </div>
                            <div className="pr-3 outline-none">
                                <TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" />
                            </div>
                            <div className="pr-3 outline-none">
                                <TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" />
                            </div>
                        </Slider>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MarketSlideMobile;