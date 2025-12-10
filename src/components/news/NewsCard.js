import React, { useState } from 'react';
import './NewsCard.css';

/**
 * Enterprise News Card Component
 * Supports two distinct industry patterns:
 * 1. 'media-object': High detail, serif headline, thumbnail (Items 1-5)
 * 2. 'ranked-list': High density, sans-serif, rank number (Items 6-10)
 */
const NewsCard = ({ article, variant = 'media-object', rank }) => {
    const [imgError, setImgError] = useState(false);

    // Format: "2 MIN READ • 01:47 PM IST"
    const formatMeta = (dateString) => {
        if (!dateString) return 'LATEST';
        const d = new Date(dateString);
        // Simple heuristic: assume 2 min read for now, or calculate based on content length if available
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `2 MIN READ • ${time}`;
    };

    // --- PATTERN 1: RANKED TYPOGRAPHIC LIST ---
    if (variant === 'ranked-list') {
        return (
            <>
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="trending-item">
                    <div className="rank-number">
                        {rank ? String(rank).padStart(2, '0') : '#'}
                    </div>
                    <div className="trending-content">
                        <span className="news-kicker">{article.source || 'MARKETS'}</span>
                        <h3 className="trending-headline">{article.title}</h3>
                        <div className="news-meta">
                            {formatMeta(article.publishedAt)}
                        </div>
                    </div>
                </a>
                <div className="hairline-divider"></div>
            </>
        );
    }

    // --- PATTERN 2: NEWS MEDIA OBJECT (Default) ---
    return (
        <>
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-item">
                <div className="news-content">
                    <span className="news-kicker">{article.source || 'NEWS'}</span>
                    <h3 className="news-headline">{article.title}</h3>
                    <div className="news-meta">
                        <span className="timestamp">{formatMeta(article.publishedAt)}</span>
                    </div>
                </div>

                {/* Thumbnail Logic: Only render if URL exists and didn't error */}
                {!imgError && article.imageUrl && (
                    <div className="news-thumbnail-wrapper">
                        <img
                            src={article.imageUrl}
                            alt=""
                            onError={() => setImgError(true)}
                            loading="lazy"
                        />
                    </div>
                )}
            </a>
            <div className="hairline-divider"></div>
        </>
    );
};

export default NewsCard;