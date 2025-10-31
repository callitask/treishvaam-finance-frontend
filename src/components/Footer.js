import React from 'react';
import { Link } from 'react-router-dom';

// --- MODIFIED: Added { className } to accept props ---
const Footer = ({ className }) => {
  const currentYear = new Date().getFullYear();
  // Modern Instagram SVG
  const InstagramIcon = ({ width = 24, height = 24 }) => (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#fff" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="#E1306C" strokeWidth="2" />
      <circle cx="16" cy="16" r="7" stroke="#E1306C" strokeWidth="2" />
      <circle cx="23" cy="9" r="2" fill="#E1306C" />
    </svg>
  );
  // Modern Facebook SVG
  const FacebookIcon = ({ width = 24, height = 24 }) => (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#fff" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="#1877F3" strokeWidth="2" />
      <path d="M20 11h-2a2 2 0 0 0-2 2v2h-2v3h2v7h3v-7h2.5l.5-3H21v-1a1 1 0 0 1 1-1h1v-3z" fill="#1877F3" />
    </svg>
  );
  const LinkedInIcon = ({ width = 24, height = 24 }) => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" role="img" width={width} height={height}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;

  return (
    // --- MODIFIED: Added ${className} to apply the passed-in classes ---
    <footer className={`bg-gray-800 text-gray-300 py-12 min-h-[200px] ${className}`}>
      <div className="container mx-auto px-6 min-h-[200px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div><h3 className="text-xl font-semibold text-white mb-4">Treishvaam Finance</h3><p className="text-sm">Empowering your financial journey through education and expert insights.</p></div>
          <div><h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4><ul className="space-y-2">
            <li><Link to="/" className="hover:text-sky-400 transition duration-300">Home</Link></li>
            <li><Link to="/about" className="hover:text-sky-400 transition duration-300">About Us</Link></li>
            <li><Link to="/vision" className="hover:text-sky-400 transition duration-300">Our Vision</Link></li>
            <li><Link to="/contact" className="hover:text-sky-400 transition duration-300">Contact</Link></li>
          </ul></div>
          <div><h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4><ul className="space-y-2 text-sm">
            <li>Email: <a href="mailto:treishvaam@gmail.com" className="hover:text-sky-400 transition duration-300 font-medium">treishvaam@gmail.com</a></li>
          </ul></div>
          <div><h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4><div className="flex space-x-4">
            <a href="https://instagram.com/treishvaamfinance" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-pink-500 transition duration-300"><InstagramIcon width="28" height="28" /></a>
            <a href="https://facebook.com/treishvaamfinance" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-blue-600 transition duration-300"><FacebookIcon width="28" height="28" /></a>
            <a href="https://linkedin.com/company/treishvaamfinance" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-blue-400 transition duration-300"><LinkedInIcon width="28" height="28" /></a>
          </div></div>
        </div>
        <div className="text-center text-sm border-t border-gray-700 pt-8"><p>&copy; {currentYear} Treishvaam Finance. All Rights Reserved.</p><p className="mt-2 text-xs max-w-3xl mx-auto text-gray-400"><strong>Disclaimer:</strong> The content on this website is for educational and informational purposes only. Treishvaam Finance is not a financial adviser. Please consult with a qualified professional before making any investment decisions.</p></div>
      </div>
    </footer>
  );
};
export default Footer;