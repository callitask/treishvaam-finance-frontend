"use client";
/**
 * AI-CONTEXT:
 * Purpose: Renders a sticky reading progress bar based on H2 elements within the article content.
 * * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Initial creation of the component.
 * • Why: To provide a visual indicator of reading progress for long-form blog posts.
 * * - EDITED:
 * • Added safety check `if (!headings || !Array.isArray(headings)) return null;`.
 * • Why: Fixed a critical hydration crash (`TypeError: Cannot read properties of undefined (reading 'filter')`) on `SinglePostPage` where the component was rendering before `extractedHeadings` was fully initialized.
 */
import React from 'react';

const ReadingProgressBar = ({ headings, activeId, progress }) => {
    // FIX: Safely handle undefined or null headings during initial client-side hydration
    if (!headings || !Array.isArray(headings)) return null;

    const majorHeadings = headings.filter(h => h.level === 2);

    const handleLinkClick = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            // Adjust for sticky header height (approx 80px-100px)
            const yOffset = -90;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="progress-nav-container sticky top-0">
            <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            {majorHeadings.length > 0 && (
                <nav className="progress-nav-labels">
                    {majorHeadings.map((heading) => (
                        <a key={heading.id} href={`#${heading.id}`}
                            onClick={(e) => handleLinkClick(e, heading.id)}
                            className={`progress-nav-label ${activeId === heading.id ? 'active' : ''}`}>
                            {heading.text}
                        </a>
                    ))}
                </nav>
            )}
        </div>
    );
};

export default ReadingProgressBar;