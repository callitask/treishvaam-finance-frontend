import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
// AI-CONTEXT: Removed Navbar and Footer imports to prevent duplication (handled by MainLayout)
import { API_URL } from '../apiConfig'; // Import base URL

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
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
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
        }
    };

    const pageTitle = "Contact Us | Treishvaam Finance";
    const pageDescription = "Get in touch with Treishvaam Finance for inquiries about our market analysis, educational content, or platform support.";
    const pageUrl = "https://treishfin.treishvaamgroup.com/contact";
    const imageUrl = "https://treishfin.treishvaamgroup.com/logo.webp";

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={pageUrl} />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:url" content={pageUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={imageUrl} />
            </Helmet>

            {/* AI-NOTE: 
               - Removed outer div with min-h-screen/bg-slate-50 because MainLayout handles the page container.
               - Removed <Navbar /> and <Footer /> to fix duplication.
               - Changed <main> to <div> to avoid nested <main> tags (MainLayout already provides one).
            */}
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
        </>
    );
};

export default ContactPage;