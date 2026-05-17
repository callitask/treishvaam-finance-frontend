// src/components/TableOfContents.js
import React, { useState } from 'react';

const TableOfContents = ({ headings, activeId, progress }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // FIX: Early return and defensive type check
  if (!headings || !Array.isArray(headings) || headings.length === 0) return null;

  const validHeadings = headings.filter(h => h && typeof h === 'object' && h.id && typeof h.id === 'string');
  
  if (validHeadings.length === 0) return null;

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
              {validHeadings.map((heading, index) => {
                // FIX: Strict skip on malformed headings to prevent crash
                if (!heading || !heading.id) return null;
                return (
                  <li key={heading.id || `toc-${index}`} className="toc-list-item">
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