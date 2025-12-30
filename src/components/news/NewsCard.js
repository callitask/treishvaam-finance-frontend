import React, { useState } from 'react';
import './NewsCard.css';
import { BASE_URL } from '../../apiConfig'; // Import backend URL for relative paths

/**
 * Enterprise News Card (Phase 3.1: Optimized for Columns)
 * - Strict Rectangular Design
 * - Landscape Hero Images
 * - Optimized Font Sizes for Narrow Widths
 */
const NewsCard = ({ article, variant = 'standard', rank }) => {
    const [imgError, setImgError] = useState(false);

    // CRITICAL SAFETY CHECK: Prevent crash if data is missing
    if (!article) return null;

    // --- FIX 1: Smart Image Resolver ---
    // Prepend Backend URL to relative paths (e.g. /api/uploads/...)
    const getImageUrl = (url) => {
        if (!url) return '/placeholder-news.jpg';
        if (url.startsWith('http')) return url;    // Absolute URL (Remote)
        if (url.startsWith('/')) return `${BASE_URL}${url}`; // Relative Path (Local)
        return url;
    };

    // --- FIX 2: Robust Date Parsing ---
    // Formatter: "2 MIN READ • 2 HOURS AGO"
    const getMeta = () => {
        if (!article.publishedAt) return "";

        try {
            // Fix SQL Timestamp "YYYY-MM-DD HH:MM:SS" -> ISO "YYYY-MM-DDTHH:MM:SS"
            // This fixes the NaN issue on strict browsers
            const dateString = article.publishedAt.toString().replace(" ", "T");
            const d = new Date(dateString);

            // Safety: Check if date is valid before processing
            if (isNaN(d.getTime())) return "2 MIN READ";

            const now = new Date();
            const diffHrs = Math.floor((now - d) / (1000 * 60 * 60));

            // Safety: If future date or calc error, default to Just Now
            if (isNaN(diffHrs)) return "2 MIN READ";

            const timeStr = diffHrs < 1 ? 'JUST NOW' : diffHrs > 24 ? d.toLocaleDateString() : `${diffHrs}H AGO`;
            return `2 MIN READ • ${timeStr}`;
        } catch (e) {
            console.warn("Date parse error", e);
            return "2 MIN READ";
        }
    };

    // --- VARIANT 1: IMPACT (The Hero - Text Below Image) ---
    if (variant === 'impact') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-impact-card">
                    <div className="nc-impact-image-container">
                        {!imgError && article.imageUrl ? (
                            <img src={getImageUrl(article.imageUrl)} alt={article.title} onError={() => setImgError(true)} />
                        ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                        )}
                    </div>
                    {/* Content Block */}
                    <div className="nc-impact-content">
                        <span className="nc-impact-kicker">{article.source || 'Top Story'}</span>
                        <h3 className="nc-impact-headline">{article.title}</h3>
                        <div className="nc-impact-meta">{getMeta()}</div>
                    </div>
                </article>
                <div className="hairline-divider"></div>
            </a>
        );
    }

    // --- VARIANT 3: MARKET SNAP (Visual Stack) ---
    if (variant === 'market-snap' && !imgError && article.imageUrl) {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-snap-card">
                    <div className="nc-snap-image">
                        <img src={getImageUrl(article.imageUrl)} alt="" onError={() => setImgError(true)} />
                    </div>
                    <h4 className="nc-snap-headline">{article.title}</h4>
                    <div className="nc-std-meta mt-2">{getMeta()}</div>
                </article>
                <div className="hairline-divider"></div>
            </a>
        );
    }

    // --- VARIANT 4: OPINION (Quote Box) ---
    if (variant === 'opinion') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-opinion-card">
                    <span className="nc-opinion-icon">“</span>
                    <h4 className="nc-opinion-headline">{article.title}</h4>
                    <div className="nc-opinion-author">{article.source || 'Analyst View'}</div>
                </article>
            </a>
        );
    }

    // --- VARIANT 5: RANKED (Trending List) ---
    if (variant === 'ranked') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-ranked-card">
                    <div className="nc-rank-number">{rank ? String(rank).padStart(2, '0') : '#'}</div>
                    <div className="nc-ranked-content">
                        <h4>{article.title}</h4>
                        <div className="nc-std-meta mt-1">{getMeta()}</div>
                    </div>
                </article>
                <div className="hairline-divider"></div>
            </a>
        );
    }

    // --- VARIANT 2: STANDARD (Default Rectangular Media Object) ---
    return (
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
            <article className="nc-standard-card">
                <div className="nc-std-content">
                    <span className="nc-std-kicker">{article.source || 'Markets'}</span>
                    <h4 className="nc-std-headline">{article.title}</h4>
                    <div className="nc-std-meta">{getMeta()}</div>
                </div>
                {!imgError && article.imageUrl && (
                    <div className="nc-std-thumbnail">
                        <img src={getImageUrl(article.imageUrl)} alt="" onError={() => setImgError(true)} loading="lazy" />
                    </div>
                )}
            </article>
            <div className="hairline-divider"></div>
        </a>
    );
};

export default NewsCard;