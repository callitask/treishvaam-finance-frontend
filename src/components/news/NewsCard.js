import React, { useState, useEffect } from 'react';
import './NewsCard.css';
import { getOptimizedImageIds } from '../../utils/imageOptimization';

/**
 * AI-CONTEXT:
 * Purpose: Renders news cards with "Self-Healing" image logic.
 * Change Intent: Confirmed fallback logic to handle legacy images gracefully.
 * Critical Logic: 
 * - Try optimized WebP first (via srcset).
 * - If 404 (onError), switch 'useFallback' to true.
 * - This forces a re-render using ONLY 'src' (the original Master file).
 */
const NewsCard = ({ article, variant = 'standard', rank }) => {
    // Track if optimized version failed
    const [useFallback, setUseFallback] = useState(false);
    // Track if even the fallback failed
    const [imgError, setImgError] = useState(false);

    // Reset state when article changes (scrolling/filtering)
    useEffect(() => {
        setUseFallback(false);
        setImgError(false);
    }, [article?.imageUrl]);

    if (!article) return null;

    // AI-NOTE: Generate URLs using the FIXED utility (preserves prefixes)
    const { src, srcset } = getOptimizedImageIds(article.imageUrl);

    const handleError = () => {
        if (!useFallback) {
            // First failure: Optimized version missing? Try Master.
            setUseFallback(true);
        } else {
            // Second failure: Master missing? Show placeholder.
            setImgError(true);
        }
    };

    const getMeta = () => {
        if (!article.publishedAt) return "";
        try {
            const dateString = article.publishedAt.toString().replace(" ", "T");
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "2 MIN READ";
            const now = new Date();
            const diffHrs = Math.floor((now - d) / (1000 * 60 * 60));
            if (isNaN(diffHrs)) return "2 MIN READ";
            const timeStr = diffHrs < 1 ? 'JUST NOW' : diffHrs > 24 ? d.toLocaleDateString() : `${diffHrs}H AGO`;
            return `2 MIN READ • ${timeStr}`;
        } catch (e) {
            return "2 MIN READ";
        }
    };

    // Determine final props based on fallback state
    // If useFallback is true, we pass undefined to srcSet, forcing the browser to use src
    const finalSrcSet = useFallback ? undefined : srcset;

    // --- VARIANT 1: IMPACT (Hero) ---
    if (variant === 'impact') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-impact-card">
                    <div className="nc-impact-image-container">
                        {!imgError && article.imageUrl ? (
                            <img
                                src={src}
                                srcSet={finalSrcSet}
                                sizes="(max-width: 768px) 100vw, 800px"
                                alt={article.title}
                                onError={handleError}
                                width="800"
                                height="450"
                                fetchpriority="high"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                        )}
                    </div>
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

    // --- VARIANT 3: MARKET SNAP ---
    if (variant === 'market-snap' && !imgError && article.imageUrl) {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-snap-card">
                    <div className="nc-snap-image">
                        <img
                            src={src}
                            srcSet={finalSrcSet}
                            sizes="(max-width: 768px) 95vw, 400px"
                            alt=""
                            onError={handleError}
                            width="400"
                            height="225"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h3 className="nc-snap-headline">{article.title}</h3>
                    <div className="nc-std-meta mt-2">{getMeta()}</div>
                </article>
                <div className="hairline-divider"></div>
            </a>
        );
    }

    // --- VARIANT 4: OPINION ---
    if (variant === 'opinion') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-opinion-card">
                    <span className="nc-opinion-icon">“</span>
                    <h3 className="nc-opinion-headline">{article.title}</h3>
                    <div className="nc-opinion-author">{article.source || 'Analyst View'}</div>
                </article>
            </a>
        );
    }

    // --- VARIANT 5: RANKED ---
    if (variant === 'ranked') {
        return (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
                <article className="nc-ranked-card">
                    <div className="nc-rank-number">{rank ? String(rank).padStart(2, '0') : '#'}</div>
                    <div className="nc-ranked-content">
                        <h3 className="text-sm font-bold leading-tight">{article.title}</h3>
                        <div className="nc-std-meta mt-1">{getMeta()}</div>
                    </div>
                </article>
                <div className="hairline-divider"></div>
            </a>
        );
    }

    // --- VARIANT 2: STANDARD (Default) ---
    return (
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="nc-link-wrapper">
            <article className="nc-standard-card">
                <div className="nc-std-content">
                    <span className="nc-std-kicker">{article.source || 'Markets'}</span>
                    <h3 className="nc-std-headline">{article.title}</h3>
                    <div className="nc-std-meta">{getMeta()}</div>
                </div>
                {!imgError && article.imageUrl && (
                    <div className="nc-std-thumbnail">
                        <img
                            src={src}
                            srcSet={finalSrcSet}
                            sizes="150px"
                            alt=""
                            onError={handleError}
                            loading="lazy"
                            width="150"
                            height="150"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </article>
            <div className="hairline-divider"></div>
        </a>
    );
};

export default NewsCard;