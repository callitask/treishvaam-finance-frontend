import React from 'react';
import NewsHighlights from '../NewsHighlights';
import DeeperDive from '../DeeperDive';

const FeaturedColumn = () => {
    return (
        // This component is used in two places:
        // 1. Desktop: As a sticky sidebar
        // 2. Mobile: As the content for the "News" slide
        <div className="sticky top-[80px] space-y-4">
            <div className="min-h-[400px]">
                <NewsHighlights />
            </div>
            <DeeperDive />
        </div>
    );
};

export default FeaturedColumn;
