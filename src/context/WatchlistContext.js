"use client";
// src/context/WatchlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
    // 1. Deterministic initial state for Next.js hydration safety
    const [watchlist, setWatchlist] = useState([]);
    const [mounted, setMounted] = useState(false);

    // 2. Initialize from LocalStorage post-hydration
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('user-watchlist');
        try {
            if (saved) {
                setWatchlist(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to parse watchlist", e);
        }
    }, []);

    // 3. Persist to LocalStorage whenever it changes
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('user-watchlist', JSON.stringify(watchlist));
    }, [watchlist, mounted]);

    // Actions
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