import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const InstagramIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" role="img"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.415 2.175 8.796 2.163 12 2.163zm0 1.441c-3.141 0-3.506.012-4.729.069-2.766.126-3.904 1.264-4.031 4.031-.057 1.223-.068 1.588-.068 4.729s.011 3.506.068 4.729c.127 2.767 1.265 3.904 4.031 4.031 1.223.057 1.588.068 4.729.068s3.506-.011 4.729-.068c2.767-.127 3.904-1.265 4.031-4.031-.057-1.223-.068-1.588-.068-4.729s-.011-3.506-.068-4.729c-.127-2.767-1.265-3.904-4.031-4.031-1.223-.057-1.588-.068-4.729-.068zm0 5.831a4.927 4.927 0 100 9.854 4.927 4.927 0 000-9.854zm0 8.413a3.486 3.486 0 110-6.972 3.486 3.486 0 010 6.972zm4.804-8.033a1.159 1.159 0 100-2.318 1.159 1.159 0 000 2.318z"/></svg>;
    const LinkedInIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" role="img"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
    return (
        <footer className="bg-gray-800 text-gray-300 py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div><h3 className="text-xl font-semibold text-white mb-4">Treishvaam Finance</h3><p className="text-sm">Empowering your financial journey through education and expert insights.</p></div>
              <div><h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4><ul className="space-y-2"><li><Link to="/about" className="hover:text-sky-400 transition duration-300">About Us</Link></li><li><Link to="/vision" className="hover:text-sky-400 transition duration-300">Our Vision</Link></li><li><Link to="/education" className="hover:text-sky-400 transition duration-300">Learn</Link></li><li><Link to="/blog" className="hover:text-sky-400 transition duration-300">Blog</Link></li><li><Link to="/contact" className="hover:text-sky-400 transition duration-300">Contact</Link></li></ul></div>
              <div><h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4><ul className="space-y-2 text-sm">
  <li>Email: <a href="mailto:treishvaam@gmail.com" className="hover:text-sky-400 transition duration-300 font-medium">treishvaam@gmail.com</a></li>
  <li>Call: <a href="tel:+917011451058" className="hover:text-sky-400 transition duration-300 font-medium">+91-701-145-1058</a></li>
</ul></div>
              <div><h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4><div className="flex space-x-4">
                {/* MODIFIED: Added explicit width and height to SVG icons for CLS */}
                <a href="https://www.instagram.com/treishvaamfinance/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-white transition duration-300"><InstagramIcon width="24" height="24" /></a>
                <a href="https://www.linkedin.com/company/treishvaamfinance/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition duration-300"><LinkedInIcon width="24" height="24" /></a>
              </div></div>
            </div>
            <div className="text-center text-sm border-t border-gray-700 pt-8"><p>&copy; {currentYear} Treishvaam Finance. All Rights Reserved.</p><p className="mt-2 text-xs max-w-3xl mx-auto text-gray-400"><strong>Disclaimer:</strong> The content on this website is for educational and informational purposes only. Treishvaam Finance is not a financial adviser. Please consult with a qualified professional before making any investment decisions.</p></div>
          </div>
        </footer>
    );
};
export default Footer;
