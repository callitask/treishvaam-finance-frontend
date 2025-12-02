import React, { useState, useEffect } from 'react';
import api from '../apiConfig';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                    phone: '+91 81785 27633',
                    address: 'Bengaluru, Karnataka, India'
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
        setIsSubmitting(true);
        setStatus({ type: '', msg: '' });
        try {
            await api.post('/contact', formData);
            setStatus({ type: 'success', msg: 'Message sent successfully! We will get back to you soon.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus({ type: 'error', msg: 'Failed to send message. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Contact Us | Treishvaam Finance</title>
                <meta name="description" content="Reach out to Treishvaam Finance for expert financial insights, course details, or partnership opportunities. We are here to help." />
                <link rel="canonical" href="https://treishfin.treishvaamgroup.com/contact" />
            </Helmet>

            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-100 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-100 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10 max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

                    {/* Left Side: Info Panel */}
                    <div className="lg:w-5/12 bg-slate-900 p-10 text-white flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-serif mb-6">Get in Touch</h1>
                            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
                                Have a question about our analysis, courses, or the platform? We're here to help you navigate your financial journey.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <Mail className="w-6 h-6 text-sky-400 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-sky-100">Email</h3>
                                        <p className="text-slate-300 text-sm mt-1">{contactInfo.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <Phone className="w-6 h-6 text-sky-400 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-sky-100">Phone</h3>
                                        <p className="text-slate-300 text-sm mt-1">{contactInfo.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <MapPin className="w-6 h-6 text-sky-400 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-sky-100">Office</h3>
                                        <p className="text-slate-300 text-sm mt-1">{contactInfo.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-700">
                            <p className="text-slate-400 text-xs">
                                &copy; {new Date().getFullYear()} Treishvaam Finance. All rights reserved.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:w-7/12 p-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="John Doe" required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                        placeholder="john@example.com" required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                    placeholder="How can we help?" required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="4"
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                                    placeholder="Write your message here..." required
                                ></textarea>
                            </div>

                            <button type="submit" disabled={isSubmitting}
                                className="w-full flex items-center justify-center py-3 px-6 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-lg shadow-sky-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><Send className="w-5 h-5 mr-2" /> Send Message</>}
                            </button>

                            {status.msg && (
                                <div className={`p-4 rounded-lg text-center text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {status.msg}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;