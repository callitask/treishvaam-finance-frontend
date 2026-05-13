/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Renders a sticky table of contents based on heading tags extracted from post content.
 *
 * Scope:
 * - Responsible for parsing headings and navigating to anchors.
 * - Must NEVER crash the UI if headings are malformed or missing.
 *
 * Critical Dependencies:
 * - Used by SinglePostPage.
 *
 * Security Constraints:
 * - Only internal anchors allowed.
 *
 * Non-Negotiables:
 * - Must gracefully handle undefined, null, or incomplete heading objects.
 *
 * Change Intent:
 * - Added deep null-guards inside mapping to prevent 'id' undefined TypeErrors.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Initial TOC component.
 * - EDITED: Added deep null guards for `heading` and `heading.id` to prevent TypeError crash.
 */
import React, { useState } from 'react';

const TableOfContents = ({ headings, activeId, progress }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!headings || !Array.isArray(headings) || headings.length === 0) return null;

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    if (!id) return;
    const element = document.getElementById(id);
    if (element) {
      // Adjust for sticky main navbar height (approx 80px-100px)
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="toc-container">
      <div className="toc-progress-track">
        <div className="toc-progress-fill" style={{ height: `${progress}%` }}></div>
      </div>

      <div className="pl-5">
        <button onClick={() => setIsExpanded(!isExpanded)} className="toc-header">
          <span>On this page</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`toc-chevron ${isExpanded ? '' : '-rotate-90'}`}>
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {isExpanded && (
          <nav className="toc-body">
            <ul>
              {headings.map((heading, index) => {
                if (!heading || !heading.id) return null;
                return (
                  <li key={heading.id || index} className="toc-list-item">
                    <a href={`#${heading.id}`}
                      onClick={(e) => handleLinkClick(e, heading.id)}
                      className={`toc-link ${activeId === heading.id ? 'active' : ''}`}
                      style={{ paddingLeft: `${(heading.level - 2) * 0.75 + 0.5}rem` }}>
                      {heading.text || ''}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;