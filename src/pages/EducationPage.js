import React from 'react';
import { Link } from 'react-router-dom';

const modules = [
    { title: "Investing 101: The Basics", description: "Learn the fundamental concepts of financial markets, including stocks, bonds, and ETFs. Understand risk and how to build a simple portfolio.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { title: "Market Analysis Techniques", description: "Dive into the methods used to evaluate investments. This module covers both fundamental analysis of company health and technical analysis of market charts.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> },
    { title: "Introduction to Retirement Planning", description: "Understand the importance of saving for the future. Learn about different types of retirement accounts, contribution strategies, and long-term growth concepts.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg> },
    { title: "Legacy & Estate Education", description: "Learn about the tools and strategies for wealth preservation and transfer, including the basic concepts of wills and trusts.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { title: "Real Estate Investing Basics", description: "An introduction to property as an asset class. Learn about financing, market evaluation, and the pros and cons of real estate investment.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { title: "Business Finance Essentials", description: "For entrepreneurs and small business owners. Learn about cash flow management, business valuation concepts, and growth financing.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> }
];

const EducationPage = () => {
    return (
        <>
            <section className="hero-silver-gradient py-20 md:py-24">
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
                                <h3 className="text-2xl font-semibold section-title mb-4">{module.title}</h3>
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


