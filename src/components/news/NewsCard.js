import React, { useState } from 'react';
import './NewsCard.css';

const NewsCard = ({ article, variant = 'standard' }) => {
    const [imgError, setImgError] = useState(false);
    const handleImgError = () => setImgError(true);

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffInHours = (now - d) / (1000 * 60 * 60);

        if (diffInHours < 1) return 'Just Now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // --- 1. IMPACT (The Hero) ---
    if (variant === 'impact') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-card nc-impact">
                <div className="nc-img-wrap-hero">
                    {!imgError && article.imageUrl ? (
                        <img src={article.imageUrl} alt={article.title} onError={handleImgError} />
                    ) : <div className="nc-gradient-placeholder" />}
                    <div className="nc-overlay">
                        <span className="nc-tag-red">Top Story</span>
                        <h3>{article.title}</h3>
                        <div className="nc-meta-light">
                            <span>{article.source}</span> • <span>{formatDate(article.publishedAt)}</span>
                        </div>
                    </div>
                </div>
            </a>
        );
    }

    // --- 2. MARKET SNAP (Image + Ticker Context) ---
    if (variant === 'marketsnap') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-card nc-marketsnap">
                <div className="nc-img-wrap-snap">
                    {!imgError && article.imageUrl ? (
                        <img src={article.imageUrl} alt={article.title} onError={handleImgError} />
                    ) : <div className="nc-solid-placeholder" />}
                </div>
                <div className="nc-content">
                    <span className="nc-tag-blue">Market Insight</span>
                    <h4>{article.title}</h4>
                    <div className="nc-meta">
                        <span className="nc-source">{article.source}</span>
                        <span className="nc-time">{formatDate(article.publishedAt)}</span>
                    </div>
                </div>
            </a>
        );
    }

    // --- 3. OPINION (No Image, Quote Style) ---
    if (variant === 'opinion') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-card nc-opinion">
                <div className="nc-opinion-body">
                    <span className="nc-quote-icon">“</span>
                    <h4 className="nc-opinion-title">{article.title}</h4>
                </div>
                <div className="nc-opinion-footer">
                    <div className="nc-author-avatar">{article.source.charAt(0)}</div>
                    <div className="nc-meta-col">
                        <span className="nc-source-bold">{article.source}</span>
                        <span className="nc-time">Opinion</span>
                    </div>
                </div>
            </a>
        );
    }

    // --- 4. COMPACT (The Ticker) ---
    if (variant === 'compact') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-card nc-compact">
                <div className="nc-compact-time">{formatDate(article.publishedAt)}</div>
                <div className="nc-compact-title">{article.title}</div>
            </a>
        );
    }

    // --- 5. STANDARD (Default Row - Moneycontrol Style) ---
    return (
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-card nc-standard">
            <div className="nc-std-left">
                <h4>{article.title}</h4>
                <div className="nc-meta">
                    <span className="nc-source">{article.source}</span>
                    <span className="nc-time">{formatDate(article.publishedAt)}</span>
                </div>
            </div>
            <div className="nc-std-right">
                {!imgError && article.imageUrl && (
                    <img src={article.imageUrl} alt="" onError={handleImgError} />
                )}
            </div>
        </a>
    );
};

export default NewsCard;