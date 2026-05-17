// src/components/ReadingProgressBar.js
import React from 'react';

const ReadingProgressBar = ({ headings, activeId, progress }) => {
    // FIX: Guard array structure defensively at component level
    if (!headings || !Array.isArray(headings)) return null;

    const majorHeadings = headings.filter(h => h && typeof h === 'object' && h.level === 2 && h.id && typeof h.id === 'string');

    const handleLinkClick = (e, id) => {
        e.preventDefault();
        if (!id) return;
        const element = document.getElementById(id);
        if (element) {
            // Adjust for sticky header height (approx 80px-100px)
            const yOffset = -90;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="progress-nav-container sticky top-0 z-40">
            <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            {majorHeadings.length > 0 && (
                <nav className="progress-nav-labels">
                    {majorHeadings.map((heading, index) => {
                        // FIX: Strict skip on malformed headings
                        if (!heading || !heading.id) return null;
                        return (
                            <a key={heading.id || `heading-${index}`} href={`#${heading.id}`}
                                onClick={(e) => handleLinkClick(e, heading.id)}
                                className={`progress-nav-label ${activeId === heading.id ? 'active' : ''}`}>
                                {heading.text || ''}
                            </a>
                        );
                    })}
                </nav>
            )}
        </div>
    );
};

export default ReadingProgressBar;