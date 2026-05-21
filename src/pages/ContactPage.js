"use client";
/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Renders the Contact Us page for Treishvaam Finance.
 * - Handles client-side submission of contact inquiries to backend API.
 *
 * Scope:
 * - Static informative page with interactive form.
 *
 * Critical Dependencies:
 * - Frontend: React Router, axios for API fetching.
 * - Worker / SEO / Sitemap: Edge relies on correct canonical tags.
 *
 * Security Constraints:
 * - Contact data sent securely via API. No keys exposed.
 *
 * Non-Negotiables:
 * - Canonical URLs must point to apex domain.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED:
 * • Replaced legacy canonical and OpenGraph URLs (treishfin.treishvaamgroup.com) with canonical apex domain (treishvaamfinance.com).
 * • Added AI-CONTEXT block.
 * • Why the edit was required: To fix Google Search Console "Discovered - currently not indexed" loop caused by mismatched cross-domain canonicals.
 *
 * - REMOVED (2026-05-15 Next.js Metadata Migration):
 * • Removed `react-helmet-async` and `<Helmet>` block.
 * • Why: Causing SSR hydration crash on Next.js Edge. Metadata now handled in `app/contact/page.tsx`.
 * - EDITED (2026-05-15 Next.js Build Fix):
 * • Added `"use client";` directive at the top of the file.
 * • Why: `ContactPage` uses React's `useState` hook for form state, which is restricted to Client Components in Next.js 14 App Router.
 * - EDITED (Phase 3 — Form Security):
 * • Added hidden honeypot field (`_website` mapped to `honeypot` state) to trap bot submissions.
 * • Why: Contact form had zero client-side bot deterrence, enabling spam/abuse.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../apiConfig';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '', honeypot: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Sending...' });

        try {
            await axios.post(`${API_URL}/api/v1/contact`, formData);
            setStatus({ type: 'success', msg: 'Message sent successfully!' });
            setFormData({ name: '', email: '', message: '', honeypot: '' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-12">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h1>
                    <p className="text-slate-600 dark:text-slate-300">Have questions about our analysis or platform? We're here to help.</p>
                </div>

                {status.msg && (
                    <div className={`mb-6 p-4 rounded-lg text-center font-medium ${status.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                        status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Phase 3: Bot honeypot — hidden from humans, filled by bots */}
                    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}
                        aria-hidden="true" tabIndex={-1}>
                        <label htmlFor="_website">Leave this blank</label>
                        <input
                            type="text"
                            id="_website"
                            name="honeypot"
                            value={formData.honeypot || ''}
                            onChange={handleChange}
                            tabIndex={-1}
                            autoComplete="off"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows="5"
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
                            placeholder="How can we help you?"
                        ></textarea>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                        >
                            Send Message
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;