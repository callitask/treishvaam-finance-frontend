import React from 'react';
import { Link } from 'react-router-dom';

const modules = [
    // The ONLY change is updating the SVG definitions below with new icons and the correct stroke color.
    { title: "Investing 101: The Basics", description: "Learn the fundamental concepts of financial markets, including stocks, bonds, and ETFs. Understand risk and how to build a simple portfolio.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { title: "Market Analysis Techniques", description: "Dive into the methods used to evaluate investments. This module covers both fundamental analysis of company health and technical analysis of market charts.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> },
    { title: "Introduction to Retirement Planning", description: "Understand the importance of saving for the future. Learn about different types of retirement accounts, contribution strategies, and long-term growth concepts.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { title: "Legacy & Estate Education", description: "Learn about the tools and- strategies for wealth preservation and transfer, including the basic concepts of wills and trusts.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 7z" /></svg> },
    { title: "Real Estate Investing Basics", description: "An introduction to property as an asset class. Learn about financing, market evaluation, and the pros and cons of real estate investment.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { title: "Business Finance Essentials", description: "For entrepreneurs and small business owners. Learn about cash flow management, business valuation concepts, and growth financing.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
];

const EducationPage = () => {
    return (
        <>
            <section className="bg-white py-20 md:py-24">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold page-main-title">Our Educational Modules</h1>
                    <p className="text-lg md:text-xl page-subtitle mt-4 max-w-2xl mx-auto">Structured learning paths to help you understand finance, from the basics to advanced topics.</p>
                </div>
            </section>
            
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {modules.map((module, index) => (
                            <div key={index} className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                                <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 service-icon-bg service-icon-text rounded-full mb-6 mx-auto">
                                    {module.icon}
                                </div>
                                <h3 className="text-2xl font-semibold service-card-title mb-4">{module.title}</h3>
                                <p className="text-gray-600 mb-6 flex-grow">{module.description}</p>
                                <Link to="#" className="mt-auto cta-button-primary text-white font-semibold py-2 px-6 rounded-lg self-center">
                                    View Module
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};
export default EducationPage;
