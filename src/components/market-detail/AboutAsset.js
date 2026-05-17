"use client";
/**
 * AI-CONTEXT:
 * Purpose: Displays the Wikipedia/Yahoo business summary for an asset.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Added "use client" directive.
 * - EDITED: Fixed prop mismatch (receives `profile` instead of `quote`) resolving the fatal white-screen crash.
 * - EDITED: Added deep-scan fallback logic for `description/summary` keys to handle variations in Spring Boot `QuoteData` and `WidgetDataDto` flattening.
 */
import React, { useState } from 'react';

const AboutAsset = ({ profile, quoteData, marketData }) => {
    const [showFullDesc, setShowFullDesc] = useState(false);

    // Scan across all provided props for the data
    const activeProfile = profile || quoteData?.profile || marketData?.profile || quoteData || marketData;

    if (!activeProfile) return null;

    // Deep scan for the summary text across known backend data model variations
    const description = 
        activeProfile.description || 
        activeProfile.longBusinessSummary || 
        activeProfile.summary || 
        activeProfile.assetProfile?.summary || 
        activeProfile.assetProfile?.description || 
        '';
        
    const name = activeProfile.name || activeProfile.shortName || activeProfile.assetProfile?.name || 'this asset';

    if (!description) return null;

    const isLongDesc = description.length > 400;
    const displayedDesc = showFullDesc ? description : description.substring(0, 400);

    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 transition-colors duration-300 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">About {name}</h2>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {displayedDesc}{!showFullDesc && isLongDesc ? '...' : ''}
            </p>

            {isLongDesc && (
                <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline mt-2"
                >
                    {showFullDesc ? 'Read Less' : 'Read More'}
                </button>
            )}

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                Source: Yahoo Finance / Wikipedia
            </p>
        </div>
    );
};

export default AboutAsset;