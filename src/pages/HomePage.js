import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getLatestPostHeadline } from '../apiConfig';

// --- New Professional Icons ---

// For "Why Learn" section (Blue Theme)
const ExpertIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const StructuredIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const SecureIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l4.5-4.5a2 2 0 012.828 0l1.414 1.414a2 2 0 002.828 0l4.5-4.5a12.02 12.02 0 00-2.433-8.617z" /></svg>;

// For "Core Learning" section (Green Theme)
const InvestingIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const AnalysisIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const RetirementIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;


const HomePage = () => {
    const [latestPostTitle, setLatestPostTitle] = useState('');

    useEffect(() => {
        const fetchLatestHeadline = async () => {
            try {
                const response = await getLatestPostHeadline();
                if (response.data && response.data.title) {
                    setLatestPostTitle(response.data.title);
                }
            } catch (error) {
                console.error("Failed to fetch latest post headline:", error);
            }
        };
        fetchLatestHeadline();
    }, []);

    const defaultTitle = "Treishfin | Daily Financial News, Market Updates & Analysis";
    const defaultDescription = "Your trusted source for daily financial news, market updates, and expert analysis.";
    const dynamicDescription = latestPostTitle || defaultDescription;

    return (
        <>
            <Helmet>
                <title>{defaultTitle}</title>
                <meta name="description" content={dynamicDescription} />
                {/* Open Graph / Facebook / LinkedIn Meta Tags */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://treishfin.treishvaamgroup.com/" />
                <meta property="og:title" content={defaultTitle} />
                <meta property="og:description" content={dynamicDescription} />
                <meta property="og:image" content="https://treishfin.treishvaamgroup.com/logo512.png" />
                {/* Twitter Meta Tags */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://treishfin.treishvaamgroup.com/" />
                <meta property="twitter:title" content={defaultTitle} />
                <meta property="twitter:description" content={dynamicDescription} />
                <meta property="twitter:image" content="https://treishfin.treishvaamgroup.com/logo512.png" />
            </Helmet>
            {/* ...existing code... */}
            <section className="hero-silver-gradient py-20 md:py-32 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight page-main-title">Treish your Finance.</h1>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto page-subtitle">Access expert-led educational content and structured learning paths to build your financial confidence.</p>
                    <Link to="/education" className="cta-button-primary text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-105">Explore Our Courses</Link>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold section-title mb-4">Why Learn with Treishvaam Finance?</h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">A trusted resource for clear, reliable, and insightful financial education.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                        {/* Card with Blue Icon Theme */}
                        <div className="bg-gray-50 p-8 rounded-xl shadow-lg text-center service-card">
                            <div className="flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6 mx-auto">
                                <ExpertIcon className="h-8 w-8 text-sky-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Expert-Led Content</h3>
                            <p className="text-gray-600">Learn from industry professionals with deep market knowledge and practical experience.</p>
                        </div>
                        {/* Card with Blue Icon Theme */}
                        <div className="bg-gray-50 p-8 rounded-xl shadow-lg text-center service-card">
                            <div className="flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6 mx-auto">
                                <StructuredIcon className="h-8 w-8 text-sky-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Structured Learning</h3>
                            <p className="text-gray-600">Our modules are designed to guide you from fundamental concepts to advanced topics seamlessly.</p>
                        </div>
                        {/* Card with Blue Icon Theme */}
                        <div className="bg-gray-50 p-8 rounded-xl shadow-lg text-center service-card">
                            <div className="flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6 mx-auto">
                                <SecureIcon className="h-8 w-8 text-sky-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Secure Platform</h3>
                            <p className="text-gray-600">Access your educational materials and track your progress on our reliable and secure learning portal.</p>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/about" className="font-semibold text-lg hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More About Us →</Link>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-sky-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold section-title mb-4">Our Core Learning Modules</h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">We offer a wide range of financial courses to meet your diverse educational needs.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card with Green Icon Theme */}
                        <div className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                                <InvestingIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Investing Fundamentals</h3>
                            <p className="text-gray-600 mb-4 flex-grow">Build a strong foundation with our modules on stocks, bonds, and market basics.</p>
                            <Link to="/education" className="font-semibold mt-auto hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More →</Link>
                        </div>
                         {/* Card with Green Icon Theme */}
                        <div className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                                <AnalysisIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Advanced Market Analysis</h3>
                            <p className="text-gray-600 mb-4 flex-grow">Explore technical and fundamental analysis techniques to evaluate opportunities.</p>
                            <Link to="/education" className="font-semibold mt-auto hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More →</Link>
                        </div>
                         {/* Card with Green Icon Theme */}
                        <div className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                                <RetirementIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Retirement Education</h3>
                            <p className="text-gray-600 mb-4 flex-grow">Learn about the different retirement accounts and strategies for long-term saving.</p>
                            <Link to="/education" className="font-semibold mt-auto hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More →</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;