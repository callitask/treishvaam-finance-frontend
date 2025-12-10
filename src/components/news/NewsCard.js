import React, { useState } from 'react';
import './NewsCard.css';

/**
 * Enterprise News Card Component
 * Renders 1 of 5 industry-standard patterns based on the 'variant' prop.
 * Handles image errors gracefully.
 */
const NewsCard = ({ article, variant = 'standard', rank }) => {
    const [imgError, setImgError] = useState(false);

    // Formatter: "2 MIN READ • 2 HOURS AGO"
    const getMeta = () => {
        const d = new Date(article.publishedAt);
        const now = new Date();
        const diffHrs = Math.floor((now - d) / (1000 * 60 * 60));
        const timeStr = diffHrs < 1 ? 'JUST NOW' : diffHrs > 24 ? d.toLocaleDateString() : `${diffHrs}H AGO`;
        return `2 MIN READ • ${timeStr}`;
    };

    // --- VARIANT 1: IMPACT (The Hero) ---
    if (variant === 'impact') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-impact-card">
                    <div className="nc-impact-image-container">
                        {!imgError && article.imageUrl ? (
                            <img src={article.imageUrl} alt={article.title} onError={() => setImgError(true)} />
                        ) : (
                            // Fallback gradient if image fails
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a8a, #172554)' }}></div>
                        )}
                        <div className="nc-impact-overlay">
                            <span className="nc-impact-kicker">Top Story</span>
                            <h3 className="nc-impact-headline">{article.title}</h3>
                            <div className="nc-impact-meta">{article.source || 'Market News'} • {getMeta()}</div>
                        </div>
                    </div>
                </article>
            </a>
        );
    }

    // --- VARIANT 3: MARKET SNAP (Visual) ---
    if (variant === 'market-snap' && !imgError && article.imageUrl) {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-snap-card">
                    <div className="nc-snap-image">
                        <img src={article.imageUrl} alt="" onError={() => setImgError(true)} />
                    </div>
                    <h4 className="nc-snap-headline">{article.title}</h4>
                    <div className="nc-std-meta mt-2">{getMeta()}</div>
                </article>
                <div className="hairline-divider"></div>
            </a>
        );
    }

    // --- VARIANT 4: OPINION (Quote) ---
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
                        <div className="nc-std-meta" style={{ marginTop: '4px' }}>{getMeta()}</div>
                    </div>
                </article>
                <div className="hairline-divider"></div>
            </a>
        );
    }

    // --- VARIANT 2: STANDARD (Default Media Object) ---
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
                        <img src={article.imageUrl} alt="" onError={() => setImgError(true)} loading="lazy" />
                    </div>
                )}
            </article>
            <div className="hairline-divider"></div>
        </a>
    );
};

export default NewsCard;