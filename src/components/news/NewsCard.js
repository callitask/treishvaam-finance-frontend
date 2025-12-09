import React, { useState } from 'react';
import './NewsCard.css';

/**
 * Enterprise News Card Component
 * Supports 3 Design Systems:
 * 1. 'impact' - Large Hero with Gradient Overlay (Top Story)
 * 2. 'focus'  - Clean Card with whitespace (Feature Story)
 * 3. 'compact'- High density list row (Market Ticker)
 */
const NewsCard = ({ article, variant = 'compact' }) => {
    const [imgError, setImgError] = useState(false);

    const handleImgError = () => setImgError(true);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Enterprise format: "10:45 AM" or "2h ago"
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // --- DESIGN 1: IMPACT (Hero) ---
    if (variant === 'impact') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-impact-container">
                <div className="nc-impact-image-wrapper">
                    {!imgError && article.imageUrl ? (
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            onError={handleImgError}
                            className="nc-impact-img"
                        />
                    ) : (
                        <div className="nc-placeholder-gradient" />
                    )}
                    <div className="nc-impact-overlay">
                        <span className="nc-tag-live">LIVE</span>
                        <h3 className="nc-impact-title">{article.title}</h3>
                        <div className="nc-meta-white">
                            <span className="nc-source">{article.source}</span>
                            <span className="nc-dot">•</span>
                            <span>{formatDate(article.publishedAt)}</span>
                        </div>
                    </div>
                </div>
            </a>
        );
    }

    // --- DESIGN 2: FOCUS (Card) ---
    if (variant === 'focus') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-focus-container">
                <div className="nc-focus-image">
                    {!imgError && article.imageUrl ? (
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            onError={handleImgError}
                            className="nc-focus-img"
                        />
                    ) : (
                        <div className="nc-placeholder-solid" />
                    )}
                </div>
                <div className="nc-focus-content">
                    <h4 className="nc-focus-title">{article.title}</h4>
                    <div className="nc-meta-gray">
                        <span className="nc-source-bold">{article.source}</span>
                        <span className="nc-time">{formatDate(article.publishedAt)}</span>
                    </div>
                </div>
            </a>
        );
    }

    // --- DESIGN 3: COMPACT (List) ---
    return (
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-compact-container">
            <div className="nc-compact-left">
                <h4 className="nc-compact-title">{article.title}</h4>
                <div className="nc-meta-micro">
                    <span className="nc-source-pill">{article.source}</span>
                    <span className="nc-time-micro">{formatDate(article.publishedAt)}</span>
                </div>
            </div>
            <div className="nc-compact-right">
                {!imgError && article.imageUrl && (
                    <img
                        src={article.imageUrl}
                        alt=""
                        onError={handleImgError}
                        className="nc-compact-thumb"
                    />
                )}
            </div>
        </a>
    );
};

export default NewsCard;