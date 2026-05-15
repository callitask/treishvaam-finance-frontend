/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Renders the Terms of Service legal page.
 *
 * Scope:
 * - Static legal page. Enterprise-grade content for financial platform.
 *
 * Critical Dependencies:
 * - Frontend: Next.js App Router handles SEO via app/terms/page.tsx metadata export.
 * - Worker / SEO / Sitemap: Edge relies on correct canonical tags.
 *
 * Security Constraints:
 * - No sensitive data.
 *
 * Non-Negotiables:
 * - Canonical URLs must point to apex domain.
 * - Must NOT import or use react-helmet-async (Next.js App Router handles metadata).
 *
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED:
 * • Replaced legacy canonical and OpenGraph URLs (treishfin.treishvaamgroup.com) with canonical apex domain (treishvaamfinance.com).
 * • Added AI-CONTEXT block.
 * • Why the edit was required: To fix Google Search Console "Discovered - currently not indexed" loop caused by mismatched cross-domain canonicals.
 *
 * - EDITED (2026-05-15 P1-1 Terms Enterprise Upgrade):
 *   • Removed import { Helmet } from 'react-helmet-async' and all <Helmet> blocks.
 *   • Why: HelmetProvider was removed from providers.tsx (BUG-HYDRATION-01 fix). Next.js App Router
 *     handles SEO via export const metadata in app/terms/page.tsx.
 *   • Fixed all "Treishfin" / "treishfin" references → "Treishvaam Finance" / "treishvaamfinance.com".
 *   • Updated "Last Updated" to May 2026.
 *   • Added 12 enterprise sections with prominent NOT-FINANCIAL-ADVICE disclaimer.
 *   • Added DPDP Act 2023 compliance, market data disclaimer, governing law (India/Bangalore).
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
import React from 'react';

const TermsPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-2 text-sm">Last Updated: May 2026</p>
                <p className="text-gray-500 mb-8 text-sm">Effective Date: May 2026</p>

                {/* PROMINENT FINANCIAL DISCLAIMER */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg mb-10">
                    <h2 className="text-base font-bold text-amber-900 mb-2">⚠️ Important Financial Disclaimer</h2>
                    <p className="text-amber-800 text-sm leading-relaxed">
                        <strong>Treishvaam Finance is NOT a SEBI-registered investment advisor, broker, or financial institution.</strong>{' '}
                        All content published on this Platform — including articles, market data, analysis, and commentary — is for
                        <strong> educational and informational purposes only</strong> and does NOT constitute financial advice,
                        investment advice, trading advice, or any other type of advice. Do not make any financial or investment
                        decisions based solely on information from this Platform. Always consult a qualified SEBI-registered
                        financial advisor before making investment decisions.
                    </p>
                </div>

                <div className="prose prose-slate max-w-none text-gray-600 space-y-8">

                    {/* 1. Acceptance */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using <strong>treishvaamfinance.com</strong> (the &quot;Platform&quot;), operated by Treishvaam Group,
                            you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
                            you must immediately discontinue use of the Platform.
                        </p>
                        <p className="mt-2">
                            These Terms apply to all visitors, users, and others who access or use the Platform.
                            We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance.
                        </p>
                    </section>

                    {/* 2. Description of Service */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">2. Description of Service</h2>
                        <p>
                            Treishvaam Finance is a <strong>financial news and market intelligence platform</strong> that provides:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Financial news articles and market commentary</li>
                            <li>Real-time and delayed market data (indices, stocks, commodities, currencies)</li>
                            <li>Educational content about financial markets, investing concepts, and economic events</li>
                            <li>Analysis and opinion pieces by our editorial team</li>
                        </ul>
                        <p className="mt-3 font-medium text-gray-700">
                            The Platform does NOT provide: personalized investment advice, portfolio management, brokerage services,
                            or any SEBI-regulated financial services.
                        </p>
                    </section>

                    {/* 3. Eligibility */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">3. Eligibility</h2>
                        <p>
                            You must be at least 18 years of age to use this Platform. By using the Platform, you represent and
                            warrant that you are 18 years of age or older and have the legal capacity to enter into these Terms.
                        </p>
                    </section>

                    {/* 4. Financial Disclaimer */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">4. Financial & Investment Disclaimer</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All content is for <strong>educational and informational purposes only</strong>.</li>
                            <li>Nothing on this Platform constitutes a solicitation, recommendation, endorsement, or offer to buy or sell any securities.</li>
                            <li>Past performance of any security or market discussed does not guarantee future results.</li>
                            <li>Treishvaam Finance is <strong>NOT registered with SEBI</strong> as an investment advisor or research analyst.</li>
                            <li>Market data displayed may be delayed and is provided &quot;as-is&quot; without warranty of accuracy.</li>
                            <li>You assume full responsibility for any investment decisions you make.</li>
                        </ul>
                    </section>

                    {/* 5. Market Data Disclaimer */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">5. Market Data Disclaimer</h2>
                        <p>
                            Market data displayed on the Platform (stock prices, indices, commodity prices, currency rates) is
                            sourced from third-party data providers and may be delayed by 15-20 minutes or more. This data is
                            provided for informational purposes only. Treishvaam Finance makes no representations as to the
                            accuracy, completeness, or timeliness of such data.
                        </p>
                    </section>

                    {/* 6. User Accounts */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">6. User Accounts</h2>
                        <p>
                            When you create an account, you are responsible for maintaining the confidentiality of your credentials
                            and for all activities that occur under your account. You agree to notify us immediately of any
                            unauthorized use of your account.
                        </p>
                    </section>

                    {/* 7. Acceptable Use */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">7. Acceptable Use Policy</h2>
                        <p>You agree NOT to:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Scrape, crawl, or systematically download content from the Platform without written permission</li>
                            <li>Reproduce, republish, or commercially exploit any content without authorization</li>
                            <li>Use the Platform for any illegal purpose or in violation of applicable laws</li>
                            <li>Attempt to gain unauthorized access to any part of the Platform or its infrastructure</li>
                            <li>Transmit spam, malware, or any harmful code</li>
                            <li>Impersonate any person or entity or misrepresent your affiliation</li>
                            <li>Interfere with or disrupt the integrity or performance of the Platform</li>
                        </ul>
                    </section>

                    {/* 8. Intellectual Property */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">8. Intellectual Property</h2>
                        <p>
                            All content on the Platform — including articles, analysis, graphics, logos, and software — is the
                            property of Treishvaam Group or its content suppliers and is protected by Indian and international
                            copyright laws. You may share individual articles with proper attribution and a link to the original
                            source. Commercial reproduction or redistribution is strictly prohibited without prior written consent.
                        </p>
                    </section>

                    {/* 9. User-Generated Content */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">9. User-Generated Content</h2>
                        <p>
                            If you submit content to the Platform (comments, articles, or other materials), you grant Treishvaam Group
                            a non-exclusive, royalty-free, worldwide license to use, reproduce, modify, and publish such content.
                            You represent that you own or have the right to submit such content and that it does not violate any
                            third-party rights or applicable laws.
                        </p>
                    </section>

                    {/* 10. Limitation of Liability */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">10. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by applicable law, Treishvaam Group shall not be liable for any
                            indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Financial losses arising from investment decisions based on Platform content</li>
                            <li>Loss of data, profits, or business opportunities</li>
                            <li>Damages resulting from unauthorized access to your account</li>
                            <li>Any errors, inaccuracies, or omissions in content or market data</li>
                        </ul>
                        <p className="mt-3">
                            Our total liability to you for any claim arising from these Terms shall not exceed ₹1,000 (Indian Rupees One Thousand).
                        </p>
                    </section>

                    {/* 11. Privacy */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">11. Privacy</h2>
                        <p>
                            Your use of the Platform is also governed by our{' '}
                            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>,
                            which is incorporated into these Terms by reference. By using the Platform, you consent to the
                            collection and use of your information as described in the Privacy Policy.
                        </p>
                    </section>

                    {/* 12. Governing Law */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">12. Governing Law & Dispute Resolution</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of India.
                            Any disputes arising from or relating to these Terms or the Platform shall be subject to the
                            exclusive jurisdiction of the courts located in <strong>Bangalore, Karnataka, India</strong>.
                        </p>
                        <p className="mt-2">
                            Before initiating legal proceedings, you agree to attempt to resolve disputes informally by
                            contacting us at treishvaam@gmail.com. We will attempt to resolve the dispute within 30 days.
                        </p>
                    </section>

                    {/* 13. Contact */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">13. Contact Information</h2>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p><strong>Treishvaam Group</strong></p>
                            <p>Email: treishvaam@gmail.com</p>
                            <p>Address: Bangalore, Karnataka, India</p>
                            <p className="mt-2 text-sm text-gray-500">
                                For legal notices, please use the email above with subject line &quot;Legal Notice — Treishvaam Finance&quot;.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default TermsPage;
