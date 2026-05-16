"use client";
/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Renders the About Us page for Treishvaam Finance.
 * - Introduces the founder and core values.
 *
 * Scope:
 * - Static informative page optimized for SEO and readability.
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
 * - Semantic HTML tags must be utilized to optimize Googlebot indexing.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Current Phase):
 * • Executed complete structural rewrite using strict semantic HTML5 tags (<main>, <header>, <section>, <article>).
 * • Enforced a uniform typography scale and removed experimental layout designs.
 * • Redesigned to reflect a top-tier financial institution's corporate page.
 * • Why: To correct indexing layout issues and guarantee an authoritative, Fortune 500-level aesthetic.
 *
 * - EDITED (Previous Phase):
 * • Completely revamped UI to Fortune 500 enterprise standards.
 * • Removed all `bg-slate-900` and dark theme elements.
 * • Implemented a highly structured, readable, and minimalist light theme.
 * • Why the edit was required: User explicitly requested a professional, clean, light-themed aesthetic.
 *
 * - EDITED:
 * • Replaced legacy canonical and OpenGraph URLs (treishfin.treishvaamgroup.com) with canonical apex domain (treishvaamfinance.com).
 * • Added AI-CONTEXT block.
 * • Why the edit was required: To fix Google Search Console "Discovered - currently not indexed" loop.
 *
 * - REMOVED (2026-05-15 Next.js Metadata Migration):
 * • Removed `react-helmet-async` and `<Helmet>` block.
 * • Why: Causing SSR hydration crash on Next.js Edge. Metadata now handled in `app/about/page.tsx`.
 *
 * - EDITED (2026-05-15 Next.js Build Fix):
 * • Added `"use client";` directive at the top of the file.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { ShieldCheck, Users, TrendingUp, Lightbulb, Linkedin, ArrowRight } from 'lucide-react';

const AboutPage = () => {
    return (
        <main className="min-h-screen bg-white selection:bg-slate-200 selection:text-slate-900">
            {/* --- Semantic Header / Hero --- */}
            <header className="pt-28 pb-20 border-b border-slate-200 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
                            Redefining Financial Literacy
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                            We bridge the gap between institutional market intelligence and individual empowerment, transforming global macroeconomic data into actionable insight.
                        </p>
                    </div>
                </div>
            </header>

            {/* --- Founder Profile Section --- */}
            <section className="py-24 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <article className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                        {/* Profile Image Column */}
                        <div className="lg:col-span-5 w-full">
                            <figure className="relative bg-slate-100 border border-slate-200 p-2 shadow-sm">
                                <LazyLoadImage
                                    src="/amitsagar-kandpal-photo.png"
                                    alt="Amitsagar Kandpal, Founder of Treishvaam Finance"
                                    className="object-cover w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
                                    effect="blur"
                                />
                                <figcaption className="bg-white border-t border-slate-200 px-6 py-4">
                                    <h2 className="text-xl font-bold text-slate-900">Amitsagar Kandpal</h2>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1">Founder & Lead Analyst</p>
                                </figcaption>
                            </figure>
                        </div>

                        {/* Founder Bio Column */}
                        <div className="lg:col-span-7 flex flex-col justify-center h-full">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">The Visionary Journey</h2>

                            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                                <p>
                                    <strong className="text-slate-900 font-semibold">Treishvaam Finance</strong> was born from a unique intersection of strategic marketing and high-stakes financial analysis. Founder Treishvaam began his journey in the competitive arenas of Career Launcher, mastering business strategy and client relations.
                                </p>
                                <p>
                                    Transitioning from corporate strategy to the dynamic world of financial markets, he honed elite expertise in <strong className="text-slate-900 font-medium">Smart Money Concepts (SMC)</strong>, the <strong className="text-slate-900 font-medium">Wyckoff Method</strong>, and <strong className="text-slate-900 font-medium">Price Action Analysis</strong>.
                                </p>
                                <p>
                                    Today, Treishvaam Finance stands as a beacon in Bengaluru, dedicated to translating complex global market events into actionable, institutional-grade insights for retail participants.
                                </p>
                            </div>

                            <div className="mt-10">
                                <a
                                    href="https://www.linkedin.com/in/amitsagarkandpal"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm rounded-sm group"
                                >
                                    <Linkedin className="mr-3 h-5 w-5" />
                                    Connect on LinkedIn
                                    <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            {/* --- Core Values Section --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Our Core Principles</h2>
                        <p className="text-lg text-slate-600 mt-3">The foundational metrics driving our analytical framework.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                        {/* Value 1 */}
                        <div className="group">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-slate-100 rounded-sm group-hover:bg-slate-900 transition-colors">
                                    <ShieldCheck className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Unwavering Integrity</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed pl-16">We uphold the highest ethical standards. Our analysis is strictly unbiased, transparent, and prioritizes capital preservation and factual accuracy over trending hype.</p>
                        </div>

                        {/* Value 2 */}
                        <div className="group">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-slate-100 rounded-sm group-hover:bg-slate-900 transition-colors">
                                    <Users className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Community Access</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed pl-16">Financial literacy is a necessity, not a privilege. We are architecting a global community network where institutional knowledge is distributed democratically.</p>
                        </div>

                        {/* Value 3 */}
                        <div className="group">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-slate-100 rounded-sm group-hover:bg-slate-900 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Data-Driven Precision</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed pl-16">Speculation is eliminated. We leverage deep macroeconomic indicators and institutional flow strategies to provide insights that are strictly empirically backed.</p>
                        </div>

                        {/* Value 4 */}
                        <div className="group">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-slate-100 rounded-sm group-hover:bg-slate-900 transition-colors">
                                    <Lightbulb className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Radical Clarity</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed pl-16">The industry is obscured by intentional jargon. Our core mission is to decode complex geopolitical and fiscal developments with absolute, actionable simplicity.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AboutPage;