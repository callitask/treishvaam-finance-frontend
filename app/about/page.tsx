"use client";
/**
 * AI-CONTEXT:
 * Purpose: Enterprise About / Firm Overview Page. Next.js App Router.
 * Scope:
 * - Serves as the authoritative corporate prospectus for the firm.
 * - Built as a dense, high-value "Financial Broadsheet" to appeal to UHNWIs and family offices.
 * Critical Dependencies:
 * - Frontend: Next.js native routing and image optimization (`next/image`).
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase):
 * • Executed clean overwrite to fix fatal build errors (duplicate exports, misplaced directives).
 * • Ensured "use client" sits at line 1. Purged duplicate React and Image imports.
 * - EDITED (Previous Phase):
 * • Completely redesigned layout into a dense "Financial Broadsheet / Newspaper" structure.
 * • Implemented strict multi-column grids, classic drop-caps, and justified serif typography.
 * • Expanded content to intelligently cover The Firm, Principal Leadership, Market Data Methodology, API-Driven Global Curation, and The Private Syndicate.
 * • Eliminated excessive whitespace to provide a rich, authoritative reading experience.
 * - EDITED (Previous Phase):
 * • Executed the approved "quiet luxury" elite aesthetic for the About page.
 * • Updated designation to "Founder and Chairman" for Amitsagar Kandpal.
 * - ADDED: Initial Next.js App Router migration for `/about`.
 */

import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#FCFBF8] text-slate-900 font-serif selection:bg-slate-300 selection:text-slate-900 pb-24">

            {/* --- THE MASTHEAD --- */}
            <header className="container mx-auto px-4 lg:px-8 pt-16 pb-6 border-b-[6px] border-double border-slate-900 mb-8 text-center">
                <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter uppercase mb-4 leading-none text-slate-900">
                    Treishvaam Finance
                </h1>
                <div className="flex flex-col md:flex-row justify-between items-center border-t border-b border-slate-900 py-2 text-xs font-bold tracking-widest uppercase mt-6 px-4">
                    <span className="mb-2 md:mb-0">The Global Intelligence Broadsheet</span>
                    <span className="mb-2 md:mb-0">Bengaluru, India Edition</span>
                    <span>Private & Confidential</span>
                </div>
            </header>

            {/* --- BROADSHEET GRID LAYOUT --- */}
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: Founder & Infrastructure (3 columns wide) */}
                    <aside className="lg:col-span-3 flex flex-col gap-10 border-b lg:border-b-0 lg:border-r border-slate-300 pr-0 lg:pr-8 pb-10 lg:pb-0">

                        {/* Founder Section */}
                        <article>
                            <div className="border-b-2 border-slate-900 mb-5 pb-2">
                                <h2 className="text-lg font-bold uppercase tracking-widest">Principal Leadership</h2>
                            </div>
                            <figure className="relative w-full aspect-[3/4] bg-slate-200 mb-4 border border-slate-300 p-1">
                                <Image
                                    src="/amitsagar-kandpal-photo.png"
                                    alt="Amitsagar Kandpal, Founder and Chairperson"
                                    fill
                                    className="object-cover grayscale"
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                    priority
                                />
                            </figure>
                            <h3 className="font-bold text-xl mb-1 text-slate-900">Amitsagar Kandpal</h3>
                            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-4">Founder & Chairperson</p>
                            <div className="text-sm leading-relaxed text-justify text-slate-700 space-y-3">
                                <p>
                                    Under the direction of Founder and Chairperson Amitsagar Kandpal, the firm's analytical methodology strips away retail noise to expose authentic market mechanics.
                                </p>
                                <p>
                                    His approach is anchored in elite expertise encompassing Smart Money Concepts (SMC), Wyckoff Accumulation and Distribution, and rigorous algorithmic price action analysis. This distinct perspective allows the firm to translate complex macroeconomic shifts into strategic directives for our private network.
                                </p>
                            </div>
                        </article>

                        {/* Tech Stack / Security Section */}
                        <article className="bg-slate-100 p-5 border border-slate-200">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-3 border-b border-slate-300 pb-2">Zero-Trust Infrastructure</h2>
                            <p className="text-xs leading-relaxed text-justify text-slate-700">
                                Privacy and absolute security are paramount for our clientele. Treishvaam Finance operates on a locked-down, military-grade Zero-Trust architecture. We employ Cloudflare Edge routing, encrypted data silos, and isolated virtual threads, ensuring that the proprietary data of our family offices remains entirely sovereign and uncompromised.
                            </p>
                        </article>
                    </aside>

                    {/* CENTER COLUMN: Lead Story & Network (6 columns wide) */}
                    <section className="lg:col-span-6 flex flex-col gap-10 border-b lg:border-b-0 lg:border-r border-slate-300 pr-0 lg:pr-8 pb-10 lg:pb-0">

                        {/* Lead Story: The Firm */}
                        <article>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-4 text-slate-900">
                                    Navigating the Complexities of Global Capital Markets
                                </h2>
                                <p className="text-lg md:text-xl italic text-slate-600 font-light">
                                    Equipping family offices with asymmetric intelligence and institutional foresight in an era of unprecedented volatility.
                                </p>
                            </div>

                            <div className="text-base md:text-lg leading-relaxed text-justify text-slate-800 space-y-6 md:columns-2 gap-8">
                                <p>
                                    <span className="float-left text-7xl font-black leading-[0.7] pr-3 pt-2 text-slate-900">T</span>
                                    reishvaam Finance operates at the vanguard of capital preservation and strategic deployment. Recognizing a critical void in actionable intelligence available to private wealth, the firm was established to democratize and refine institutional-grade data. We do not engage in retail speculation; our mandate is the provision of definitive, empirical foresight.
                                </p>
                                <p>
                                    The global financial landscape is increasingly obscured by high-frequency algorithmic trading and intentionally complex corporate jargon. Our primary function is to cut through this opacity. By leveraging a synthesis of historical market analysis and real-time geopolitical monitoring, we empower private capital to anticipate market reactions before they are broadly priced into global equities.
                                </p>
                                <p>
                                    Our firm operates with absolute, uncompromised independence. We have no external algorithmic influence or hidden stakeholder biases. This autonomy ensures that our analysis remains transparent and fiercely dedicated to the long-term capital preservation of our clients, transforming raw data into strategic advantage.
                                </p>
                            </div>
                        </article>

                        <div className="w-full h-[1px] bg-slate-300 my-2"></div>

                        {/* The Network & Community */}
                        <article>
                            <h2 className="text-3xl font-black mb-4 text-slate-900">The Private Syndicate</h2>
                            <p className="text-lg leading-relaxed text-justify text-slate-800">
                                Beyond proprietary analysis, Treishvaam Finance functions as a secure conduit for high-net-worth interaction. We are actively architecting an exclusive intelligence network. By connecting like-minded family offices, venture funds, and institutional capital, we cultivate a strictly private forum built on shared strategic insight. This collective intelligence ensures that our syndicate is not merely reacting to the market, but comprehensively understanding the undercurrents that drive it.
                            </p>
                        </article>

                    </section>

                    {/* RIGHT COLUMN: Market Data & Global Curation (3 columns wide) */}
                    <aside className="lg:col-span-3 flex flex-col gap-10">

                        {/* Market Data */}
                        <article>
                            <div className="border-b-2 border-slate-900 mb-5 pb-2">
                                <h2 className="text-lg font-bold uppercase tracking-widest">Empirical Data</h2>
                            </div>
                            <div className="text-sm leading-relaxed text-justify text-slate-700 space-y-4">
                                <p>
                                    <strong className="font-bold text-slate-900">Precision Analysis.</strong> Speculation is an unacceptable risk parameter. Our internal framework is governed by deep macroeconomic indicators, institutional flow tracking, and quantitative modeling.
                                </p>
                                <p>
                                    Every thesis presented by Treishvaam Finance is rigorously vetted against live market conditions, ensuring that our investors deploy wealth based on empirical realities rather than market sentiment.
                                </p>
                            </div>
                        </article>

                        {/* Global News Curation (API Context) */}
                        <article>
                            <div className="border-b-2 border-slate-900 mb-5 pb-2">
                                <h2 className="text-lg font-bold uppercase tracking-widest">Global Curation</h2>
                            </div>
                            <div className="text-sm leading-relaxed text-justify text-slate-700 space-y-4">
                                <p>
                                    <strong className="font-bold text-slate-900">Signal Over Noise.</strong> In a media landscape saturated with bias and contradictory reporting, accurate information is a premium asset.
                                </p>
                                <p>
                                    To combat this, our platform utilizes a proprietary aggregation engine that interfaces directly with elite, third-party global news APIs. Our system continuously ingests millions of data points from the world's leading financial desks.
                                </p>
                                <p>
                                    However, we do not merely regurgitate this data. Our internal systems intelligently filter, curate, and distill these vast feeds. We extract only the most critical geopolitical and financial developments, presenting our syndicate with a silent, highly-focused brief of the events that genuinely move markets.
                                </p>
                            </div>
                        </article>

                    </aside>

                </div>
            </div>

            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </main>
    );
}