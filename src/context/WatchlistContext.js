// src/context/WatchlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
    // 1. Initialize from LocalStorage
    const [watchlist, setWatchlist] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('user-watchlist');
            try {
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                console.error("Failed to parse watchlist", e);
                return [];
            }
        }
        return [];
    });

    // 2. Persist to LocalStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('user-watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    // 3. Actions
    const addToWatchlist = (ticker) => {
        setWatchlist((prev) => {
            if (!prev.includes(ticker)) return [...prev, ticker];
            return prev;
        });
    };

    const removeFromWatchlist = (ticker) => {
        setWatchlist((prev) => prev.filter((t) => t !== ticker));
    };

    const toggleWatchlist = (ticker) => {
        if (watchlist.includes(ticker)) {
            removeFromWatchlist(ticker);
        } else {
            addToWatchlist(ticker);
        }
    };

    const isInWatchlist = (ticker) => watchlist.includes(ticker);

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
};