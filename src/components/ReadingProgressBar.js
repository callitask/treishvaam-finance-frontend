// src/components/ReadingProgressBar.js
import React from 'react';

const ReadingProgressBar = ({ headings, activeId, progress }) => {
    const majorHeadings = headings.filter(h => h.level === 2);

    const handleLinkClick = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            // Adjust for sticky header height (approx 80px-100px)
            const yOffset = -90; 
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
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