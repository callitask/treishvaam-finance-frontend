"use client";
/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Renders the About Us page for Treishvaam Finance.
 * - Introduces the founder and core values.
 *
 * Scope:
 * - Static informative page.
 *
 * Critical Dependencies:
 * - Frontend: React Router / Next.js Navigation.
 * - Worker / SEO / Sitemap: Edge relies on correct canonical tags.
 *
 * Security Constraints:
 * - No sensitive data.
 *
 * Non-Negotiables:
 * - Canonical URLs must point to apex domain.
 * - Must strictly adhere to a light-themed, enterprise-grade minimalist aesthetic (No dark backgrounds).
 *
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Current Phase):
 * • Completely revamped UI to Fortune 500 enterprise standards.
 * • Removed all `bg-slate-900` and dark theme elements.
 * • Implemented a highly structured, readable, and minimalist light theme.
 * • Why the edit was required: User explicitly requested a professional, clean, light-themed aesthetic akin to top enterprise platforms.
 *
 * - EDITED:
 * • Replaced legacy canonical and OpenGraph URLs (treishfin.treishvaamgroup.com) with canonical apex domain (treishvaamfinance.com).
 * • Added AI-CONTEXT block.
 * • Why the edit was required: To fix Google Search Console "Discovered - currently not indexed" loop caused by mismatched cross-domain canonicals.
 *
 * - REMOVED (2026-05-15 Next.js Metadata Migration):
 * • Removed `react-helmet-async` and `<Helmet>` block.
 * • Why: Causing SSR hydration crash on Next.js Edge. Metadata now handled in `app/about/page.tsx`.
 *
 * - EDITED (2026-05-15 Next.js Build Fix):
 * • Added `"use client";` directive at the top of the file.
 * • Why: `react-lazy-load-image-component` uses legacy lifecycle methods that crash the Next.js Server Component compiler (`TypeError: Super expression must either be null or a function`).
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { ShieldCheck, Users, TrendingUp, Lightbulb, Linkedin } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-white selection:bg-slate-200 selection:text-slate-900 text-slate-800">
            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50 border-b border-slate-100">
                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-light text-slate-900 tracking-tight mb-6 font-serif">
                        Redefining <span className="font-semibold text-slate-700">Financial Literacy</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 mx-auto font-light leading-relaxed">
                        We bridge the gap between institutional knowledge and individual empowerment.
                    </p>
                </div>
            </section>

            {/* --- Founder Profile Section --- */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
                        {/* Profile Image Card */}
                        <div className="lg:w-5/12 w-full">
                            <div className="relative overflow-hidden bg-slate-100 aspect-[4/5] max-w-sm mx-auto shadow-sm border border-slate-200 rounded-sm">
                                <LazyLoadImage
                                    src="/amitsagar-kandpal-photo.png"
                                    alt="Amitsagar Kandpal, Founder of Treishvaam Finance"
                                    className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                                    effect="blur"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-6 border-t border-slate-100">
                                    <h2 className="text-xl font-semibold text-slate-900 font-serif">Amitsagar Kandpal</h2>
                                    <p className="text-sm tracking-widest uppercase text-slate-500 mt-1">Founder & Lead Analyst</p>
                                </div>
                            </div>
                        </div>

                        {/* Founder Bio */}
                        <div className="lg:w-7/12 w-full space-y-8">
                            <div>
                                <h2 className="text-3xl font-light text-slate-900 font-serif mb-2">The Visionary Journey</h2>
                                <div className="h-px w-16 bg-slate-300"></div>
                            </div>

                            <div className="prose prose-lg text-slate-600 leading-relaxed font-light">
                                <p>
                                    <strong>Treishvaam Finance</strong> was born from a unique intersection of strategic marketing and high-stakes financial analysis. Founder Treishvaam began his journey in the competitive arenas of Career Launcher, mastering business strategy and client relations.
                                </p>
                                <p>
                                    Transitioning from corporate strategy to the dynamic world of financial markets, he honed expertise in <span className="text-slate-800 font-medium">Smart Money Concepts (SMC)</span>, the <span className="text-slate-800 font-medium">Wyckoff Method</span>, and <span className="text-slate-800 font-medium">Price Action Analysis</span>.
                                </p>
                                <p>
                                    Today, Treishvaam Finance stands as a beacon in Bengaluru, dedicated to translating complex global market events into actionable insights for everyone.
                                </p>
                            </div>
                            <div className="pt-6">
                                <a href="https://www.linkedin.com/in/amitsagarkandpal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors rounded-sm">
                                    <Linkedin className="mr-3 h-4 w-4" />
                                    Connect on LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Core Values Grid --- */}
            <section className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-light text-slate-900 font-serif mb-4">Our Core Values</h2>
                        <div className="h-px w-16 bg-slate-300 mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Value 1 */}
                        <div className="p-8 bg-white border border-slate-200 hover:border-slate-300 transition-colors group rounded-sm shadow-sm hover:shadow-md">
                            <ShieldCheck className="w-8 h-8 text-slate-400 mb-6 group-hover:text-slate-800 transition-colors" strokeWidth={1.5} />
                            <h3 className="text-xl font-semibold text-slate-900 mb-3 font-serif">Unwavering Integrity</h3>
                            <p className="text-slate-500 leading-relaxed font-light">We uphold the highest ethical standards. Our analysis is unbiased, transparent, and always prioritizes the learner's best interest over market trends.</p>
                        </div>

                        {/* Value 2 */}
                        <div className="p-8 bg-white border border-slate-200 hover:border-slate-300 transition-colors group rounded-sm shadow-sm hover:shadow-md">
                            <Users className="w-8 h-8 text-slate-400 mb-6 group-hover:text-slate-800 transition-colors" strokeWidth={1.5} />
                            <h3 className="text-xl font-semibold text-slate-900 mb-3 font-serif">Community First</h3>
                            <p className="text-slate-500 leading-relaxed font-light">Financial literacy shouldn't be a privilege. We are building a global community where knowledge is shared freely and mentorship is accessible to all.</p>
                        </div>

                        {/* Value 3 */}
                        <div className="p-8 bg-white border border-slate-200 hover:border-slate-300 transition-colors group rounded-sm shadow-sm hover:shadow-md">
                            <TrendingUp className="w-8 h-8 text-slate-400 mb-6 group-hover:text-slate-800 transition-colors" strokeWidth={1.5} />
                            <h3 className="text-xl font-semibold text-slate-900 mb-3 font-serif">Data-Driven Expertise</h3>
                            <p className="text-slate-500 leading-relaxed font-light">We don't guess; we analyze. Leveraging deep market knowledge and institutional strategies to provide insights that are empirically backed.</p>
                        </div>

                        {/* Value 4 */}
                        <div className="p-8 bg-white border border-slate-200 hover:border-slate-300 transition-colors group rounded-sm shadow-sm hover:shadow-md">
                            <Lightbulb className="w-8 h-8 text-slate-400 mb-6 group-hover:text-slate-800 transition-colors" strokeWidth={1.5} />
                            <h3 className="text-xl font-semibold text-slate-900 mb-3 font-serif">Radical Clarity</h3>
                            <p className="text-slate-500 leading-relaxed font-light">Finance is burdened with jargon. We strip it away. Our mission is to communicate complex geopolitical and macroeconomic topics with absolute simplicity.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;