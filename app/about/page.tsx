/**
 * AI-CONTEXT:
 * Purpose: Enterprise About / Firm Overview Page. Next.js App Router.
 * Scope:
 * - Serves as the authoritative corporate prospectus for the firm.
 * - Optimized for Google indexing using semantic HTML and Next.js native Image component.
 * Critical Dependencies:
 * - Frontend: Next.js native routing and image optimization (`next/image`).
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase):
 * • Migrated layout to match the unboxed, elite editorial aesthetic of the Login terminal.
 * • Upgraded copywriting to explicitly target UHNWIs, family offices, and institutional investors.
 * • Replaced retail terminology ("Community", "Visionary") with institutional nomenclature ("Private Syndicate", "Principal Analysis").
 * • Replaced legacy `react-lazy-load-image-component` with Next.js `<Image>` for Core Web Vitals optimization.
 * • Implemented 1-pixel separator lines and high-contrast typography hierarchy.
 * - ADDED: Initial Next.js App Router migration for `/about`.
 */
import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Network, LineChart, Target, Linkedin, ArrowRight } from 'lucide-react';

export const metadata = {
    title: 'Firm Overview | Treishvaam Global Terminal',
    description: 'Independent financial journalism, institutional market analysis, and uncompromised macroeconomic foresight for private capital.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900 pb-24">

            {/* --- Editorial Hero Section --- */}
            <header className="container mx-auto px-6 lg:px-12 pt-28 lg:pt-36 pb-12">
                <div className="max-w-4xl animate-fade-in-up">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Firm Overview</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                        The Network for <span className="font-serif font-light italic text-slate-500">Intelligent</span> Capital.
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
                        Providing family offices and private capital with independent financial journalism, institutional market analysis, and uncompromised macroeconomic foresight.
                    </p>
                </div>
            </header>

            {/* --- Sleek Separator --- */}
            <div className="container mx-auto px-6 lg:px-12">
                <div className="w-full h-[1px] bg-slate-200 mb-20"></div>
            </div>

            {/* --- Principal Leadership & Analysis --- */}
            <section className="container mx-auto px-6 lg:px-12 mb-24">
                <article className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                    {/* Portrait Image Column */}
                    <div className="lg:col-span-5 w-full">
                        <figure className="relative bg-white border border-slate-200 p-2 shadow-sm">
                            <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden">
                                <Image
                                    src="/amitsagar-kandpal-photo.png"
                                    alt="Amitsagar Kandpal, Principal Analyst"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                            <figcaption className="bg-white px-6 py-5 border-t border-slate-100">
                                <h2 className="text-xl font-serif font-medium text-slate-900">Amitsagar Kandpal</h2>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Principal Analyst & Founder</p>
                            </figcaption>
                        </figure>
                    </div>

                    {/* Firm Methodology Column */}
                    <div className="lg:col-span-7 flex flex-col justify-center h-full pt-4 lg:pt-0">
                        <h2 className="text-3xl lg:text-4xl font-serif font-medium text-slate-900 mb-8">Principal Leadership</h2>

                        <div className="space-y-6 text-base lg:text-lg text-slate-600 leading-relaxed font-light">
                            <p>
                                <strong className="text-slate-900 font-medium">Treishvaam Finance</strong> operates at the intersection of strategic capital deployment and high-stakes market analysis. Recognizing a critical void in actionable intelligence for private wealth, the firm was established to democratize institutional-grade data.
                            </p>
                            <p>
                                Driven by expertise in <strong className="text-slate-900 font-medium">Smart Money Concepts (SMC)</strong>, <strong className="text-slate-900 font-medium">Wyckoff Accumulation/Distribution</strong>, and algorithmic price action analysis, our methodology strips away retail noise to expose authentic market mechanics.
                            </p>
                            <p>
                                Headquartered in Bengaluru, our intelligence network continuously translates complex global macroeconomic shifts into precise, strategic directives for our syndicate of investors and family offices.
                            </p>
                        </div>

                        <div className="mt-12">
                            <a
                                href="https://www.linkedin.com/in/amitsagarkandpal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm rounded-sm group"
                            >
                                <Linkedin className="mr-3 h-4 w-4" />
                                Professional Network
                                <ArrowRight className="ml-3 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </article>
            </section>

            {/* --- Core Methodology Grid (Editorial Style) --- */}
            <section className="bg-white border-y border-slate-200 py-24">
                <div className="container mx-auto px-6 lg:px-12">

                    <div className="mb-16 border-b border-slate-200 pb-6 flex items-end justify-between">
                        <h2 className="text-2xl font-serif font-medium text-slate-900">Operating Principles</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hidden sm:block">Internal Directives</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                        {/* Principle 1 */}
                        <div className="group relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-slate-100 group-hover:bg-slate-900 transition-colors hidden lg:block"></div>
                            <div className="flex items-center space-x-4 mb-4">
                                <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" strokeWidth={2} />
                                <h3 className="text-lg font-serif font-medium text-slate-900">Institutional Integrity</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm lg:text-base font-light">
                                We operate with absolute independence. Our analysis is strictly unbiased, transparent, and prioritizes long-term capital preservation over transient market trends and algorithmic noise.
                            </p>
                        </div>

                        {/* Principle 2 */}
                        <div className="group relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-slate-100 group-hover:bg-slate-900 transition-colors hidden lg:block"></div>
                            <div className="flex items-center space-x-4 mb-4">
                                <Network className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" strokeWidth={2} />
                                <h3 className="text-lg font-serif font-medium text-slate-900">Private Syndicate</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm lg:text-base font-light">
                                We are architecting an exclusive intelligence network. By connecting like-minded family offices and institutional capital, we foster a community built on shared strategic insight.
                            </p>
                        </div>

                        {/* Principle 3 */}
                        <div className="group relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-slate-100 group-hover:bg-slate-900 transition-colors hidden lg:block"></div>
                            <div className="flex items-center space-x-4 mb-4">
                                <LineChart className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" strokeWidth={2} />
                                <h3 className="text-lg font-serif font-medium text-slate-900">Empirical Precision</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm lg:text-base font-light">
                                Speculation is an unacceptable risk parameter. We leverage deep macroeconomic indicators and institutional flow tracking to provide intelligence that is rigorously and empirically verified.
                            </p>
                        </div>

                        {/* Principle 4 */}
                        <div className="group relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-slate-100 group-hover:bg-slate-900 transition-colors hidden lg:block"></div>
                            <div className="flex items-center space-x-4 mb-4">
                                <Target className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" strokeWidth={2} />
                                <h3 className="text-lg font-serif font-medium text-slate-900">Signal Over Noise</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm lg:text-base font-light">
                                The financial industry thrives on obscurity and complex jargon. Our core directive is radical clarity: isolating critical signals and decoding geopolitical developments efficiently.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </main>
    );
}