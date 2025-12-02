import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Users, TrendingUp, Lightbulb, Linkedin } from 'lucide-react';

const AboutPage = () => {
    return (
        <>
            <Helmet>
                <title>About Us | Treishvaam Finance</title>
                <meta name="description" content="Treishvaam Finance is democratizing financial literacy through expert market analysis and education. Meet our founder, Amitsagar Kandpal, and discover our mission." />
                <link rel="canonical" href="https://treishfin.treishvaamgroup.com/about" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://treishfin.treishvaamgroup.com/about" />
                <meta property="og:title" content="About Treishvaam Finance" />
                <meta property="og:description" content="Empowering your financial journey with clarity, integrity, and data-driven expertise." />
                <meta property="og:image" content="https://treishfin.treishvaamgroup.com/logo.webp" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="About Treishvaam Finance" />
                <meta name="twitter:description" content="Meet the team bridging the gap between complex markets and financial freedom." />
            </Helmet>

            {/* --- Hero Section --- */}
            <section className="relative bg-slate-900 py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 font-serif">
                        Redefining <span className="text-sky-400">Financial Literacy</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light">
                        We bridge the gap between institutional knowledge and individual empowerment.
                    </p>
                </div>
            </section>

            {/* --- Founder Profile Section --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
                        {/* Profile Image Card */}
                        <div className="lg:w-1/3 w-full">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/5] max-w-sm mx-auto">
                                <LazyLoadImage
                                    src="/amitsagar-kandpal-photo.png"
                                    alt="Amitsagar Kandpal, Founder of Treishvaam Finance"
                                    className="object-cover w-full h-full"
                                    effect="blur"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6">
                                    <h2 className="text-2xl font-bold text-white font-serif">Amitsagar Kandpal</h2>
                                    <p className="text-sky-300 font-medium">Founder & Lead Analyst</p>
                                </div>
                            </div>
                        </div>

                        {/* Founder Bio */}
                        <div className="lg:w-2/3 w-full space-y-6">
                            <h2 className="text-3xl font-bold text-slate-900 border-b-2 border-sky-100 pb-4 inline-block">The Visionary Journey</h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed">
                                <p>
                                    <strong>Treishvaam Finance</strong> was born from a unique intersection of strategic marketing and high-stakes financial analysis. Founder <strong>Treishvaam</strong> began his journey in the competitive arenas of Career Launcher, mastering business strategy and client relations.
                                </p>
                                <p>
                                    Transitioning from corporate strategy to the dynamic world of financial markets, he honed expertise in <strong>Smart Money Concepts (SMC)</strong>, <strong>Wyckoff Method</strong>, and <strong>Price Action Analysis</strong>.
                                </p>
                                <p>
                                    Today, Treishvaam Finance stands as a beacon in Bengaluru, dedicated to translating complex global market events into actionable insights for everyone.
                                </p>
                            </div>
                            <div className="pt-4">
                                <a href="https://www.linkedin.com/in/amitsagarkandpal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-[#0077b5] text-white rounded-lg font-semibold hover:bg-[#006396] transition-all shadow-md hover:shadow-lg">
                                    <Linkedin className="mr-2 h-5 w-5" />
                                    Connect on LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Core Values Grid --- */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
                        <div className="h-1 w-20 bg-sky-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Value 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 group">
                            <div className="w-14 h-14 bg-sky-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-sky-500 transition-colors duration-300">
                                <ShieldCheck className="w-8 h-8 text-sky-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Unwavering Integrity</h3>
                            <p className="text-slate-600 leading-relaxed">We uphold the highest ethical standards. Our analysis is unbiased, transparent, and always prioritizes the learner's best interest over trends.</p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 group">
                            <div className="w-14 h-14 bg-sky-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-sky-500 transition-colors duration-300">
                                <Users className="w-8 h-8 text-sky-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Community First</h3>
                            <p className="text-slate-600 leading-relaxed">Financial literacy shouldn't be a privilege. We are building a global community where knowledge is shared freely and mentorship is accessible.</p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 group">
                            <div className="w-14 h-14 bg-sky-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-sky-500 transition-colors duration-300">
                                <TrendingUp className="w-8 h-8 text-sky-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Data-Driven Expertise</h3>
                            <p className="text-slate-600 leading-relaxed">We don't guess; we analyze. Leveraging deep market knowledge and institutional strategies like SMC to provide insights that actually work.</p>
                        </div>

                        {/* Value 4 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 group">
                            <div className="w-14 h-14 bg-sky-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-sky-500 transition-colors duration-300">
                                <Lightbulb className="w-8 h-8 text-sky-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Radical Clarity</h3>
                            <p className="text-slate-600 leading-relaxed">Finance has too much jargon. We strip it away. Our mission is to communicate complex topics with simplicity, making them actionable for you.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutPage;