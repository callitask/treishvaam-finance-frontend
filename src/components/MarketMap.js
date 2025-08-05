import React, { useState } from 'react';
import MarketSection from './market/MarketSection';
import QuoteList from './market/QuoteList';
import MoversList from './market/MoversList';

const useLoadingState = () => {
    const [isLoading, setIsLoading] = useState(true);
    const handleLoadingStateChange = (loadingStatus) => {
        setIsLoading(loadingStatus);
    };
    return [isLoading, handleLoadingStateChange];
};

const MarketMap = () => {
    const [indianIndicesLoading, setIndianIndicesLoading] = useLoadingState();
    const [globalMarketsLoading, setGlobalMarketsLoading] = useLoadingState();
    const [topStocksLoading, setTopStocksLoading] = useLoadingState();
    const [etfsLoading, setEtfsLoading] = useLoadingState();

    const indianIndices = ['^NSEI', '^BSESN'];
    const globalIndices = ['^GSPC', '^IXIC', '^FTSE', '^N225'];
    const topStocks = ['RELIANCE.BSE', 'TCS.BSE', 'AAPL', 'MSFT'];
    const topETFs = ['SPY', 'QQQ', 'VTI', 'IWM'];

    return (
        <div>
            <MarketSection title="Indian Indices" defaultOpen={true} isLoading={indianIndicesLoading}>
                <QuoteList symbols={indianIndices} onLoadingStateChange={setIndianIndicesLoading} />
            </MarketSection>

            <MarketSection title="Global Markets" isLoading={globalMarketsLoading}>
                <QuoteList symbols={globalIndices} onLoadingStateChange={setGlobalMarketsLoading} />
            </MarketSection>

            <MarketSection title="Top Stocks" isLoading={topStocksLoading}>
                <QuoteList symbols={topStocks} onLoadingStateChange={setTopStocksLoading} />
            </MarketSection>

            <MarketSection title="Market Movers">
                <MoversList />
            </MarketSection>
            
            <MarketSection title="Major ETFs" isLoading={etfsLoading}>
                <QuoteList symbols={topETFs} onLoadingStateChange={setEtfsLoading} />
            </MarketSection>
        </div>
    );
};

export default MarketMap;