import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const articles = [
    { isFeatured: true, category: "Market News", title: "Federal Reserve Signals Potential Rate Cut in Q3", summary: "Central bank officials hint at monetary policy adjustments following recent inflation data, providing critical insights for active traders...", author: "Sarah Johnson", authorImg: "https://placehold.co/32x32/E0F2FE/0369a1?text=SJ", date: "June 11, 2025", views: "2.1k", readTime: "5 min read", imgSrc: "https://placehold.co/600x400/7DD3FC/0369a1?text=Featured+Analysis", link: "#" },
    { isFeatured: false, category: "Technical Analysis", title: "Advanced Technical Analysis: AI-Driven Trading Patterns", summary: "Expert analysis of emerging AI-driven trading patterns and their implications for sophisticated trading strategies.", author: "Michael Chen", authorImg: "https://placehold.co/32x32/E0F2FE/0284c7?text=MC", date: "June 11, 2025", views: "1.8k", readTime: "8 min read", imgSrc: "https://placehold.co/400x250/BAE6FD/0369a1?text=AI+Trading", link: "#" },
    { isFeatured: false, category: "Crypto", title: "Bitcoin Strategy: Breaking $45,000 Resistance Analysis", summary: "Detailed strategy analysis for crypto traders as Bitcoin demonstrates renewed strength with institutional adoption continuing...", author: "David Rodriguez", authorImg: "https://placehold.co/32x32/BAE6FD/0284c7?text=DR", date: "June 10, 2025", views: "3.1k", readTime: "6 min read", imgSrc: "https://placehold.co/400x250/7DD3FC/0369a1?text=Bitcoin", link: "#" },
    { isFeatured: false, category: "Market News", title: "Oil Trading Strategy: OPEC+ Meeting Impact Analysis", summary: "Strategic insights for commodity traders as energy markets find equilibrium amid production quota discussions.", author: "Emma Williams", authorImg: "https://placehold.co/32x32/E0F2FE/0ea5e9?text=EW", date: "June 10, 2025", views: "1.2k", readTime: "7 min read", imgSrc: "https://placehold.co/400x250/38BDF8/0369a1?text=Oil+Trading", link: "#" },
];

const featuredArticle = articles.find(a => a.isFeatured);
const regularArticles = articles.filter(a => !a.isFeatured);

const BlogPage = () => {
    return (
        <>
            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 inline-block">
                            <span style={{ color: 'var(--text-black)' }}>Financial </span><span style={{ color: 'var(--primary-darker)' }}>News & Analysis</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700">Stay ahead with timely market developments, expert analysis, and strategic insights tailored for your <strong className="font-semibold">trading</strong> journey.</p>
                    </div>
                </div>
            </section>

            <section className="pt-0 pb-4 md:pt-0 md:pb-6 bg-white">
                <div className="container mx-auto px-6">
                    <div className="p-3 rounded-lg mb-8 flex items-center shadow" style={{ backgroundColor: 'var(--danger-red-pale)' }}>
                        <span className="breaking-button relative inline-flex items-center text-white text-xs font-bold uppercase px-3 py-1 rounded-md mr-2" style={{ backgroundColor: 'var(--danger-red)' }}><span className="pulse"></span>BREAKING</span>
                        <p className="text-sm flex-grow" style={{ color: 'var(--danger-red-dark)' }}>Market Alert: Major tech stocks surge 3% following AI partnership announcements. <Link to="#" className="font-semibold hover:underline" style={{ color: 'var(--danger-red)' }}>Read full analysis</Link></p>
                    </div>

                    {featuredArticle && (
                        <div className="rounded-xl shadow-lg overflow-hidden mb-10 md:flex">
                            <div className="md:w-1/2">
                                <Link to={featuredArticle.link}>
                                    <LazyLoadImage alt={featuredArticle.title} effect="blur" src={featuredArticle.imgSrc} className="h-full w-full object-cover" />
                                </Link>
                            </div>
                            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                <span className="text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2 self-start bg-gray-100 text-gray-800 border">{featuredArticle.category}</span>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"><Link to={featuredArticle.link} className="hover:text-sky-600 transition">{featuredArticle.title}</Link></h2>
                                <p className="text-sm md:text-base mb-4 text-gray-700">{featuredArticle.summary}</p>
                                <div className="flex items-center text-xs text-gray-500 mb-4">
                                    <LazyLoadImage src={featuredArticle.authorImg} alt={featuredArticle.author} className="w-6 h-6 rounded-full mr-2" effect="blur" />
                                    <span>{featuredArticle.author} </span><span className="mx-2">|</span><span>{featuredArticle.date}</span><span className="mx-2">|</span>
                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    <span>{featuredArticle.views}</span><span className="mx-2">|</span><span>{featuredArticle.readTime}</span>
                                </div>
                                <Link to={featuredArticle.link} className="font-semibold py-2 px-6 rounded-lg text-center self-start text-sm text-white bg-sky-500 transition duration-300 hover:bg-sky-600">Read Full Article</Link>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularArticles.map((article, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                                <Link to={article.link}>
                                    <LazyLoadImage alt={article.title} effect="blur" src={article.imgSrc} className="h-48 w-full object-cover" />
                                </Link>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="mb-3">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full inline-block mr-2 bg-gray-100 text-gray-800 border">{article.category}</span>
                                        <span className="text-xs text-gray-500">{article.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2"><Link to={article.link} className="hover:text-sky-600 transition">{article.title} </Link></h3>
                                    <p className="text-sm text-gray-600 mb-3 flex-grow">{article.summary}</p>
                                    <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                                        <LazyLoadImage src={article.authorImg} alt={article.author} className="w-6 h-6 rounded-full mr-2" effect="blur" />
                                        <span>{article.author}</span>
                                        <span className="ml-auto">{article.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogPage;
