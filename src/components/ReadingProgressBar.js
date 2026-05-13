/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Displays a horizontal reading progress bar and top-level headings navigation.
 *
 * Scope:
 * - Responsible for showing reading progress.
 *
 * Critical Dependencies:
 * - Used by SinglePostPage.
 *
 * Security Constraints:
 * - None.
 *
 * Non-Negotiables:
 * - Must safely handle empty or malformed headings arrays.
 *
 * Change Intent:
 * - Added deep null-guards to prevent `Cannot read properties of undefined (reading 'id')`.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Original implementation.
 * - EDITED: Added deep null guards for majorHeadings to prevent TypeError crash.
 */
import React from 'react';

const ReadingProgressBar = ({ headings, activeId, progress }) => {
    if (!headings || !Array.isArray(headings)) return null;

    const majorHeadings = headings.filter(h => h && h.level === 2 && h.id);

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
        <div className="progress-nav-container sticky top-0">
            <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            {majorHeadings.length > 0 && (
                <nav className="progress-nav-labels">
                    {majorHeadings.map((heading, index) => {
                        if (!heading || !heading.id) return null;
                        return (
                            <a key={heading.id || index} href={`#${heading.id}`}
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