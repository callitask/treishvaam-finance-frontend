import React, { useState, useEffect } from 'react';
import api from '../apiConfig';
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('');
    const [contactInfo, setContactInfo] = useState({ email: 'Loading...', phone: 'Loading...', address: 'Loading...' });

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const response = await api.get('/contact/info');
                setContactInfo(response.data);
            } catch (error) {
                console.error("Failed to fetch contact info:", error);
                setContactInfo({
                    email: 'info@treishvaamgroup.com',
                    phone: '+1 (555) 123-4567',
                    address: '123 Finance St, Money City'
                });
            }
        };
        fetchContactInfo();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');
        try {
            await api.post('/contact', formData);
            setStatus('Message sent successfully!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Contact form submission error:', error);
            setStatus('An error occurred. Please try again.');
        }
    };

    return (
        <>
            <Helmet>
                {/* SYNC FIX: Matches Backend format */}
                <title>Treishfin · Contact Us</title>
                <link rel="canonical" href="https://treishfin.treishvaamgroup.com/contact" />
            </Helmet>
            <section className="hero-silver-gradient py-20 md:py-24">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight page-main-title">Contact Us</h1>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto page-subtitle">Have a question about our courses, partnerships, or the platform? We're here to help.</p>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h2 className="text-2xl md:text-3xl font-bold section-title mb-6">Send Us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Question about a course" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Tell us how we can help you..." className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500" required></textarea>
                                </div>
                                <div className="text-right">
                                    <button type="submit" className="cta-button-primary text-white font-semibold py-3 px-6 rounded-lg transition duration-300">Send Message</button>
                                </div>
                                {status && <p className="mt-4 text-center">{status}</p>}
                            </form>
                        </div>
                        <div className="flex flex-col space-y-8">
                            <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center">
                                <h2 className="text-2xl md:text-3xl font-bold section-title mb-6 text-center">Contact Information</h2>
                                <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="contact-info-icon-bg contact-info-icon-text flex items-center justify-center w-14 h-14 rounded-full mb-2 bg-sky-100 text-sky-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                                        <p className="text-gray-600">{contactInfo.email}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="contact-info-icon-bg contact-info-icon-text flex items-center justify-center w-14 h-14 rounded-full mb-2 bg-sky-100 text-sky-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.135a11.249 11.249 0 005.405 5.405l1.135-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                                        <p className="text-gray-600">{contactInfo.phone}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="contact-info-icon-bg contact-info-icon-text flex items-center justify-center w-14 h-14 rounded-full mb-2 bg-sky-100 text-sky-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                                        <p className="text-gray-600">{contactInfo.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
export default ContactPage;