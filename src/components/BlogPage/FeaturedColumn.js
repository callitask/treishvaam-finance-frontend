import React from 'react';
import NewsIntelligenceWidget from '../news/NewsIntelligenceWidget';

const FeaturedColumn = () => {
    return (
        <div className="w-full h-full sticky top-[100px]">
            {/* The Widget handles its own height and scrolling internal to the card */}
            <NewsIntelligenceWidget />
        </div>
    );
};

export default FeaturedColumn;