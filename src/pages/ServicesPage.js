import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const services = [
    { title: "Financial Planning", description: "Comprehensive roadmaps to navigate your financial journey, from budgeting and saving to wealth accumulation and protection.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, link: "/contact?service=financial-planning" },
    { title: "Investment Management", description: "Strategic portfolio construction and ongoing management to grow your assets.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>, link: "/contact?service=investment-management" },
    { title: "Retirement Planning", description: "Secure your golden years with robust retirement plans and income strategies.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>, link: "/contact?service=retirement-planning" },
    { title: "Estate Planning", description: "Protect your legacy and ensure your assets are distributed according to your wishes.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, link: "/contact?service=estate-planning" },
    { title: "Real Estate Advisory", description: "Expert advice for your property investments, buying, selling, or financing decisions.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, link: "/contact?service=real-estate-advisory" },
    { title: "Business Financial Consulting", description: "Strategic financial advice to help your business thrive. We assist with cash flow management, growth strategies, and more.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, link: "/contact?service=business-consulting" }
];

const ServicesPage = () => {
    return (
        <>
            <Helmet>
                <title>Services | Treishfin</title>
            </Helmet>
            <section className="hero-silver-gradient py-20 md:py-24">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold page-main-title">Our Financial Services</h1>
                    <p className="text-lg md:text-xl page-subtitle mt-4 max-w-2xl mx-auto">Tailored solutions to help you navigate your financial journey and achieve your goals.</p>
                </div>
            </section>
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {services.map((service, index) => (
                            <div key={index} className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                                <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 service-icon-bg service-icon-text rounded-full mb-6 mx-auto">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-semibold section-title mb-4">{service.title}</h3>
                                <p className="text-gray-600 mb-6 flex-grow">{service.description}</p>
                                <Link to={service.link} className="mt-auto cta-button-primary text-white font-semibold py-2 px-6 rounded-lg self-center">
                                    Request Consultation
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ServicesPage;