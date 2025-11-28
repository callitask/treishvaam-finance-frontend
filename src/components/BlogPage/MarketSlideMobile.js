import React from 'react';
import Slider from "react-slick";
import TopMoversCard from '../market/TopMoversCard';
// CORRECTION: Uses ../../ to step out of 'BlogPage' and 'components' to reach 'src'
import { getMostActive, getTopGainers, getTopLosers } from '../../apiConfig';
import IndexCharts from '../market/IndexCharts';
import GlobalMarketTicker from '../market/GlobalMarketTicker';

const MarketSlideMobile = () => {
    const marketSliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        className: "pb-8"
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Sticky Ticker Tape */}
            <div className="sticky top-14 z-20 bg-white border-b border-gray-200 shadow-sm">
                <GlobalMarketTicker />
            </div>

            <div className="p-4 space-y-6">
                {/* Section 1: Indices Chart */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Global Indices</h3>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="p-2">
                        <IndexCharts />
                    </div>
                </section>

                {/* Section 2: Movers Swiper */}
                <section>
                    <h3 className="font-serif font-bold text-xl text-gray-900 mb-3 px-1 border-l-4 border-sky-600 pl-2">
                        Market Movers
                    </h3>
                    <Slider {...marketSliderSettings}>
                        <div className="px-1">
                            <TopMoversCard title="Most Active" fetchData={getMostActive} type="active" />
                        </div>
                        <div className="px-1">
                            <TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" />
                        </div>
                        <div className="px-1">
                            <TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" />
                        </div>
                    </Slider>
                </section>
            </div>
        </div>
    );
};

export default MarketSlideMobile;