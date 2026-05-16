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
 * • Executed the approved "quiet luxury" elite aesthetic for the About page.
 * • Removed all visible references to "Treishvaam" from the content and metadata.
 * • Updated designation to "Founder and Chairman" for Amitsagar Kandpal.
 * • Replaced SaaS-style icon grids with an elegant Roman numeral (I, II, III) staggered layout.
 * • Replaced the terminal hero with a classic, whitespace-heavy Serif heading ("Intelligence Without Compromise").
 * - EDITED (Previous Phase):
 * • Migrated layout to an unboxed editorial aesthetic.
 * • Upgraded copywriting to explicitly target UHNWIs and family offices.
 * • Replaced legacy image loader with Next.js native `<Image>` component.
 * - ADDED: Initial Next.js App Router migration for `/about`.
 */
import React from 'react';
import Image from 'next/image';
import { Linkedin, ArrowRight } from 'lucide-react';

export const metadata = {
    title: 'Firm Overview | Private Intelligence Network',
    description: 'Independent financial journalism, institutional market analysis, and uncompromised macroeconomic foresight for private capital.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900 pb-24">

            {/* --- Elite Editorial Hero Section --- */}
            <header className="container mx-auto px-6 lg:px-12 pt-32 lg:pt-48 pb-20">
                <div className="max-w-5xl animate-fade-in-up">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="w-8 h-[1px] bg-slate-400"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Firm Overview</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-serif text-slate-900 tracking-tight leading-[1.1] mb-8">
                        Intelligence <br />
                        <span className="font-light italic text-slate-500">Without Compromise.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed font-light">
                        Equipping family offices and private capital with independent financial journalism, institutional market analysis, and uncompromised macroeconomic foresight.
                    </p>
                </div>
            </header>

            {/* --- Executive Leadership Memorandum --- */}
            <section className="container mx-auto px-6 lg:px-12 mb-32">
                <article className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start border-t border-slate-200 pt-16">

                    {/* Portrait Image Column */}
                    <div className="lg:col-span-5 w-full">
                        <figure className="relative bg-white border border-slate-200 p-2 shadow-sm">
                            <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden">
                                <Image
                                    src="/amitsagar-kandpal-photo.png"
                                    alt="Amitsagar Kandpal, Founder and Chairman"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                            <figcaption className="bg-white px-6 py-5 border-t border-slate-100">
                                <h2 className="text-xl font-serif font-medium text-slate-900">Amitsagar Kandpal</h2>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Founder and Chairman</p>
                            </figcaption>
                        </figure>
                    </div>

                    {/* Chairman's Overview Column */}
                    <div className="lg:col-span-7 flex flex-col justify-center h-full pt-4 lg:pt-0">
                        <h2 className="text-3xl lg:text-4xl font-serif font-medium text-slate-900 mb-8">Executive Leadership</h2>

                        <div className="space-y-6 text-base lg:text-lg text-slate-600 leading-relaxed font-light">
                            <p>
                                Operating at the intersection of strategic capital deployment and high-stakes market analysis, the firm was established to provide private wealth with actionable, institutional-grade intelligence.
                            </p>
                            <p>
                                Under the direction of Founder and Chairman <strong className="text-slate-900 font-medium">Amitsagar Kandpal</strong>, our methodology strips away retail noise to expose authentic market mechanics. This approach is anchored in elite expertise encompassing Smart Money Concepts (SMC), Wyckoff Accumulation/Distribution, and algorithmic price action analysis.
                            </p>
                            <p>
                                From our headquarters in Bengaluru, our private network continuously translates complex global macroeconomic shifts into precise, strategic directives for an exclusive syndicate of family offices and institutional investors.
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

            {/* --- Operating Tenets (Staggered Roman Numeral Layout) --- */}
            <section className="bg-white border-y border-slate-200 py-32">
                <div className="container mx-auto px-6 lg:px-12 max-w-5xl">

                    <div className="mb-24 text-center">
                        <h2 className="text-3xl lg:text-4xl font-serif font-medium text-slate-900">Operating Tenets</h2>
                        <div className="w-12 h-[1px] bg-slate-400 mx-auto mt-8"></div>
                    </div>

                    <div className="space-y-20 lg:space-y-28">
                        {/* Tenet I */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
                            <div className="md:col-span-3 text-4xl lg:text-5xl font-serif text-slate-300 italic">I.</div>
                            <div className="md:col-span-9">
                                <h3 className="text-2xl font-serif font-medium text-slate-900 mb-4">Empirical Rigor</h3>
                                <p className="text-slate-600 leading-relaxed text-lg font-light max-w-2xl">
                                    Speculation is an unacceptable risk parameter. We leverage deep macroeconomic indicators and institutional flow tracking to provide intelligence that is strictly and empirically verified.
                                </p>
                            </div>
                        </div>

                        {/* Tenet II */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
                            <div className="md:col-span-3 text-4xl lg:text-5xl font-serif text-slate-300 italic">II.</div>
                            <div className="md:col-span-9">
                                <h3 className="text-2xl font-serif font-medium text-slate-900 mb-4">Absolute Independence</h3>
                                <p className="text-slate-600 leading-relaxed text-lg font-light max-w-2xl">
                                    We operate with uncompromised autonomy. Our analysis remains strictly unbiased, prioritizing long-term capital preservation over transient market trends, algorithms, or external influence.
                                </p>
                            </div>
                        </div>

                        {/* Tenet III */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
                            <div className="md:col-span-3 text-4xl lg:text-5xl font-serif text-slate-300 italic">III.</div>
                            <div className="md:col-span-9">
                                <h3 className="text-2xl font-serif font-medium text-slate-900 mb-4">Private Syndicate</h3>
                                <p className="text-slate-600 leading-relaxed text-lg font-light max-w-2xl">
                                    We are architecting an exclusive intelligence network. By connecting family offices and institutional capital, we cultivate a strictly private forum built on shared strategic insight and high-signal data.
                                </p>
                            </div>
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