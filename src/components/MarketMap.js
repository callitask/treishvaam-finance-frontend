import React from 'react';
import MarketSection from './market/MarketSection';
import QuoteList from './market/QuoteList';
import MoversList from './market/MoversList';


const indianIndices = ['^NSEI', '^BSESN']; // NIFTY 50, SENSEX
const globalIndices = ['^GSPC', '^IXIC', '^FTSE', '^N225']; // S&P 500, NASDAQ, FTSE 100, Nikkei 225
const topStocks = ['RELIANCE.BSE', 'TCS.BSE', 'AAPL', 'MSFT'];
const topETFs = ['SPY', 'QQQ', 'VTI', 'IWM']; // Top US ETFs

const MarketMap = () => {
    return (
        <div>
            <MarketSection title="Indian Indices" defaultOpen={true}>
                <QuoteList symbols={indianIndices} />
            </MarketSection>

            <MarketSection title="Global Markets">
                <QuoteList symbols={globalIndices} />
            </MarketSection>

            <MarketSection title="Top Stocks">
                <QuoteList symbols={topStocks} />
            </MarketSection>

            <MarketSection title="Market Movers">
                <MoversList />
            </MarketSection>
            
            {/* --- IMPLEMENTED ETF SECTION --- */}
            <MarketSection title="Major ETFs">
                <QuoteList symbols={topETFs} />
            </MarketSection>
        </div>
    );
};

export default MarketMap;
