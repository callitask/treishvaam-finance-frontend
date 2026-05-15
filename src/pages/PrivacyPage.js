/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Renders the Privacy Policy legal page.
 *
 * Scope:
 * - Static legal page. Enterprise-grade content for financial platform.
 *
 * Critical Dependencies:
 * - Frontend: Next.js App Router handles SEO via app/privacy/page.tsx metadata export.
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
 * - EDITED (2026-05-15 P1-1 Privacy Enterprise Upgrade):
 *   • Removed import { Helmet } from 'react-helmet-async' and all <Helmet> blocks.
 *   • Why: HelmetProvider was removed from providers.tsx (BUG-HYDRATION-01 fix). Next.js App Router
 *     handles SEO via export const metadata in app/privacy/page.tsx.
 *   • Fixed all "Treishfin" / "treishfin" references → "Treishvaam Finance" / "treishvaamfinance.com".
 *   • Updated "Last Updated" to May 2026.
 *   • Added 12 enterprise sections: Introduction, Data Collection, GA4 Analytics Disclosure,
 *     Cookies Table, How We Use Data, Third-Party Services, Data Retention, Data Security,
 *     DPDP Act 2023 Compliance, Children's Privacy, Changes to Policy, Grievance Officer.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-2 text-sm">Last Updated: May 2026</p>
                <p className="text-gray-500 mb-8 text-sm">Effective Date: May 2026</p>

                <div className="prose prose-slate max-w-none text-gray-600 space-y-8">

                    {/* 1. Introduction */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Treishvaam Finance (<strong>"we,"</strong> <strong>"our,"</strong> or <strong>"us"</strong>),
                            operated by Treishvaam Group. We are committed to protecting your personal data and respecting your privacy.
                            This Privacy Policy explains how we collect, use, store, and protect information when you visit
                            <strong> treishvaamfinance.com</strong> (the "Platform") and use our services.
                        </p>
                        <p className="mt-2">
                            By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound
                            by this Privacy Policy. If you do not agree, please discontinue use of the Platform immediately.
                        </p>
                    </section>

                    {/* 2. Data We Collect */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">2. Information We Collect</h2>
                        <p className="mb-3">We collect the following categories of information:</p>

                        <h3 className="text-lg font-semibold text-gray-700 mb-2">2.1 Information You Provide</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Account Data:</strong> Name, email address, and profile information when you create an account via Keycloak authentication.</li>
                            <li><strong>Content Data:</strong> Articles, comments, or other content you submit through the Platform.</li>
                            <li><strong>Contact Data:</strong> Information you provide when contacting us via the contact form.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">2.2 Information Collected Automatically</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Technical Data:</strong> IP address (anonymized), browser type and version, operating system, device type, screen resolution.</li>
                            <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, scroll depth, referral source.</li>
                            <li><strong>Location Data:</strong> Approximate geographic location derived from IP address (city/country level only).</li>
                        </ul>
                    </section>

                    {/* 3. GA4 Analytics Disclosure */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">3. Google Analytics 4 (GA4) Disclosure</h2>
                        <p>
                            We use <strong>Google Analytics 4</strong> (GA4) to understand how visitors interact with our Platform.
                            GA4 collects data automatically when you visit any page, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Page views and navigation paths</li>
                            <li>Session duration and engagement metrics</li>
                            <li>Device and browser information</li>
                            <li>Approximate geographic location (city/country)</li>
                            <li>Referral source (how you arrived at the Platform)</li>
                        </ul>
                        <p className="mt-3">
                            <strong>IP Anonymization:</strong> We have enabled IP anonymization (<code>anonymize_ip: true</code>) in our GA4 configuration.
                            Your full IP address is never stored by Google Analytics.
                        </p>
                        <p className="mt-2">
                            <strong>How to Opt Out:</strong> You can opt out of Google Analytics tracking by:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                            <li>Installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
                            <li>Using your browser's "Do Not Track" setting</li>
                            <li>Using a privacy-focused browser or browser extension that blocks tracking scripts</li>
                        </ul>
                    </section>

                    {/* 4. Cookies */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">4. Cookies and Similar Technologies</h2>
                        <p className="mb-3">We use the following cookies:</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold border-b">Cookie</th>
                                        <th className="px-4 py-2 text-left font-semibold border-b">Provider</th>
                                        <th className="px-4 py-2 text-left font-semibold border-b">Purpose</th>
                                        <th className="px-4 py-2 text-left font-semibold border-b">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-2 border-b">_ga</td>
                                        <td className="px-4 py-2 border-b">Google Analytics</td>
                                        <td className="px-4 py-2 border-b">Distinguishes unique users</td>
                                        <td className="px-4 py-2 border-b">2 years</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 border-b">_ga_*</td>
                                        <td className="px-4 py-2 border-b">Google Analytics</td>
                                        <td className="px-4 py-2 border-b">Maintains session state</td>
                                        <td className="px-4 py-2 border-b">2 years</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 border-b">KC_SESSION</td>
                                        <td className="px-4 py-2 border-b">Keycloak (Auth)</td>
                                        <td className="px-4 py-2 border-b">Authentication session</td>
                                        <td className="px-4 py-2 border-b">Session</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 border-b">__cf_bm</td>
                                        <td className="px-4 py-2 border-b">Cloudflare</td>
                                        <td className="px-4 py-2 border-b">Bot management</td>
                                        <td className="px-4 py-2 border-b">30 minutes</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 5. How We Use Data */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">5. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To provide, maintain, and improve the Platform and its content</li>
                            <li>To authenticate users and manage account access</li>
                            <li>To analyze usage patterns and improve user experience</li>
                            <li>To detect, prevent, and address technical issues and security threats</li>
                            <li>To communicate with you about your account or our services</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    {/* 6. Third-Party Services */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">6. Third-Party Services</h2>
                        <p>We use the following third-party services that may process your data:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Google Analytics 4:</strong> Website analytics and usage tracking</li>
                            <li><strong>Keycloak:</strong> Identity and access management (authentication)</li>
                            <li><strong>Cloudflare:</strong> Content delivery network, DDoS protection, and DNS</li>
                            <li><strong>Grafana Cloud (Faro):</strong> Real User Monitoring (RUM) for performance</li>
                        </ul>
                        <p className="mt-2">
                            Each third-party service operates under its own privacy policy. We encourage you to review their policies.
                        </p>
                    </section>

                    {/* 7. Data Retention */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">7. Data Retention</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Account Data:</strong> Retained for the duration of your account. Deleted within 30 days of account deletion request.</li>
                            <li><strong>Analytics Data:</strong> Google Analytics data is retained for 14 months, after which it is automatically deleted.</li>
                            <li><strong>Server Logs:</strong> Retained for 90 days for security and debugging purposes.</li>
                            <li><strong>Content Data:</strong> Published content remains on the Platform unless you request its removal.</li>
                        </ul>
                    </section>

                    {/* 8. Data Security */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">8. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your data, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>TLS 1.3 encryption for all data in transit</li>
                            <li>AES-256 encryption for sensitive data at rest</li>
                            <li>Web Application Firewall (ModSecurity) for threat detection</li>
                            <li>Rate limiting and brute force protection</li>
                            <li>Regular security audits and vulnerability assessments</li>
                            <li>Zero-trust network architecture via Cloudflare Tunnel</li>
                        </ul>
                    </section>

                    {/* 9. DPDP Act 2023 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">9. Digital Personal Data Protection Act, 2023 (India)</h2>
                        <p>
                            In compliance with the <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP Act) of India,
                            we affirm the following:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Lawful Purpose:</strong> We process personal data only for lawful purposes as described in this policy.</li>
                            <li><strong>Data Minimization:</strong> We collect only the data necessary for the stated purposes.</li>
                            <li><strong>Storage Limitation:</strong> Personal data is not retained beyond the period necessary for its purpose.</li>
                            <li><strong>Right to Access:</strong> You may request a summary of your personal data processed by us.</li>
                            <li><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete personal data.</li>
                            <li><strong>Right to Erasure:</strong> You may request deletion of your personal data, subject to legal retention requirements.</li>
                            <li><strong>Right to Grievance Redressal:</strong> You may contact our Grievance Officer (details below) for any concerns.</li>
                            <li><strong>Right to Nominate:</strong> You may nominate another individual to exercise your rights in case of death or incapacity.</li>
                        </ul>
                    </section>

                    {/* 10. Children's Privacy */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">10. Children&apos;s Privacy</h2>
                        <p>
                            The Platform is not intended for individuals under the age of 18. We do not knowingly collect personal
                            data from children. If we become aware that we have collected personal data from a child without
                            verifiable parental consent, we will take steps to delete that information promptly.
                        </p>
                    </section>

                    {/* 11. Changes */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">11. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
                            updated "Last Updated" date. We encourage you to review this policy periodically. Continued use of the
                            Platform after changes constitutes acceptance of the revised policy.
                        </p>
                    </section>

                    {/* 12. Grievance Officer */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">12. Grievance Officer & Contact</h2>
                        <p>
                            In accordance with the DPDP Act, 2023, the details of our Grievance Officer are as follows:
                        </p>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p><strong>Grievance Officer:</strong> Amitsagar Kandpal</p>
                            <p><strong>Organization:</strong> Treishvaam Group</p>
                            <p><strong>Email:</strong> treishvaam@gmail.com</p>
                            <p><strong>Address:</strong> Bangalore, Karnataka, India</p>
                            <p className="mt-2 text-sm text-gray-500">
                                We will acknowledge your grievance within 24 hours and resolve it within 30 days of receipt.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
