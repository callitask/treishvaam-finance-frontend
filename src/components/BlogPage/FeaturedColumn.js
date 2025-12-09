import React from 'react';
import NewsIntelligenceWidget from '../news/NewsIntelligenceWidget';

const FeaturedColumn = () => {
    return (
        <div className="w-full h-full sticky top-[100px]">
            <NewsIntelligenceWidget />
        </div>
    );
};

export default FeaturedColumn;