import React, { useState } from 'react';
import './NewsCard.css';
import { BASE_URL } from '../../apiConfig';

/**
 * Enterprise News Card (Phase 3.1: Optimized for Columns)
 * - Strict Rectangular Design
 * - Landscape Hero Images
 * - Optimized Font Sizes for Narrow Widths
 * - FIXED: Image Resolution for Raw Filenames
 */
const NewsCard = ({ article, variant = 'standard', rank }) => {
    const [imgError, setImgError] = useState(false);

    // CRITICAL SAFETY CHECK: Prevent crash if data is missing
    if (!article) return null;

    // --- FIX 1: Smart Image Resolver (CORRECTED) ---
    const getImageUrl = (url) => {
        if (!url) return '/placeholder-news.jpg';

        // 1. External URLs (http/https) -> Return as is
        if (url.startsWith('http') || url.startsWith('https')) return url;

        // 2. Relative Paths (starts with /) -> Append to Base URL
        if (url.startsWith('/')) return `${BASE_URL}${url}`;

        // 3. Raw Filenames (e.g., "b234-image.jpg") -> Append /api/uploads/
        // This was missing and caused images to disappear
        return `${BASE_URL}/api/uploads/${url}`;
    };

    // --- FIX 2: Robust Date Parsing ---
    const getMeta = () => {
        if (!article.publishedAt) return "";

        try {
            // Fix SQL Timestamp "YYYY-MM-DD HH:MM:SS" -> ISO "YYYY-MM-DDTHH:MM:SS"
            const dateString = article.publishedAt.toString().replace(" ", "T");
            const d = new Date(dateString);

            if (isNaN(d.getTime())) return "2 MIN READ";

            const now = new Date();
            const diffHrs = Math.floor((now - d) / (1000 * 60 * 60));

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
                        <h4 className="nc-impact-headline">{article.title}</h4>
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