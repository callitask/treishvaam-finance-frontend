import React from 'react';
import Slider from "react-slick";
import TopMoversCard from '../market/TopMoversCard';
import { getMostActive, getTopGainers, getTopLosers } from '../../apiConfig';
import IndexCharts from '../market/IndexCharts';

const MarketSlideMobile = () => {
    const marketSliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, arrows: false };

    return (
        <div className="p-4 outline-none">
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Market Movers</h3>
                <div className="market-slider-container pb-6 -mx-2">
                    <style>{`.market-slider-container .slick-dots li button:before { font-size: 10px; color: #9ca3af; } .market-slider-container .slick-dots li.slick-active button:before { color: #0284c7; }`}</style>
                    <Slider {...marketSliderSettings}>
                        <div className="px-2"><TopMoversCard title="Most Active" fetchData={getMostActive} type="active" /></div>
                        <div className="px-2"><TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" /></div>
                        <div className="px-2"><TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" /></div>
                    </Slider>
                </div>
                <div className="mt-8"><IndexCharts /></div>
            </div>
        </div>
    );
};

export default MarketSlideMobile;
