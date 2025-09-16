// src/components/TableOfContents.js
import React, { useState } from 'react';

const TableOfContents = ({ headings, activeId, progress }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (!headings || headings.length === 0) return null;

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        // Adjust for sticky main navbar height (approx 80px-100px)
        const yOffset = -90; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  return (
    // UPDATED: Added relative positioning for the progress bar
    <div className="toc-container">
      {/* NEW: Vertical Progress Bar */}
      <div className="toc-progress-track">
        <div className="toc-progress-fill" style={{ height: `${progress}%` }}></div>
      </div>

      {/* UPDATED: Added left padding to avoid overlapping the progress bar */}
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
              {headings.map((heading) => (
                <li key={heading.id} className="toc-list-item">
                  <a href={`#${heading.id}`} 
                     onClick={(e) => handleLinkClick(e, heading.id)}
                     className={`toc-link ${activeId === heading.id ? 'active' : ''}`}
                     style={{ paddingLeft: `${(heading.level - 2) * 0.75 + 0.5}rem` }}>
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;