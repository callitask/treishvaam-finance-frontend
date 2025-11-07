import React from 'react';
import Slider from "react-slick";
import TopMoversCard from '../market/TopMoversCard';
import { getMostActive, getTopGainers, getTopLosers } from '../../apiConfig';
import IndexCharts from '../market/IndexCharts';

const MarketSlideMobile = () => {
    // Added 'centerPadding' and adjusted settings to ensure cards don't touch screen edges abruptly if they peek.
    const marketSliderSettings = {
        dots: true,
        infinite: false, // Better for strictly 3 categories
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        centerMode: false // Ensure full card is shown 
    };

    return (
        <div className="p-4 outline-none bg-gray-50 min-h-screen">
            <div className="mt-4 pt-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Market Movers</h3>
                {/* Added mx-auto and max-w to constrain width on larger mobile screens if needed */}
                <div className="market-slider-container pb-8">
                    <style>{`.market-slider-container .slick-dots { bottom: 0px; } .market-slider-container .slick-dots li button:before { font-size: 8px; color: #d1d5db; opacity: 1; } .market-slider-container .slick-dots li.slick-active button:before { color: #0284c7; }`}</style>
                    <Slider {...marketSliderSettings}>
                        <div className="px-1"><TopMoversCard title="Most Active" fetchData={getMostActive} type="active" /></div>
                        <div className="px-1"><TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" /></div>
                        <div className="px-1"><TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" /></div>
                    </Slider>
                </div>
                <div className="mt-6">
                    <IndexCharts />
                </div>
            </div>
        </div>
    );
};

export default MarketSlideMobile;