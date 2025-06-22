import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// --- Static Data Definition ---
const articles = [
    { isFeatured: true, category: "Market News", title: "Federal Reserve Signals Potential Rate Cut in Q3", summary: "Central bank officials hint at monetary policy adjustments following recent inflation data, providing critical insights for active traders...", author: "Sarah Johnson", authorImg: "https://placehold.co/32x32/E0F2FE/0369a1?text=SJ", date: "June 11, 2025", views: "2.1k", readTime: "5 min read", imgSrc: "https://placehold.co/600x400/7DD3FC/0369a1?text=Featured+Analysis", link: "#" },
    { isFeatured: false, category: "Technical Analysis", title: "Advanced Technical Analysis: AI-Driven Trading Patterns", summary: "Expert analysis of emerging AI-driven trading patterns and their implications for sophisticated trading strategies.", author: "Michael Chen", authorImg: "https://placehold.co/32x32/E0F2FE/0284c7?text=MC", date: "June 11, 2025", views: "1.8k", readTime: "8 min read", imgSrc: "https://placehold.co/400x250/BAE6FD/0369a1?text=AI+Trading", link: "#" },
    { isFeatured: false, category: "Crypto", title: "Bitcoin Strategy: Breaking $45,000 Resistance Analysis", summary: "Detailed strategy analysis for crypto traders as Bitcoin demonstrates renewed strength with institutional adoption continuing...", author: "David Rodriguez", authorImg: "https://placehold.co/32x32/BAE6FD/0284c7?text=DR", date: "June 10, 2025", views: "3.1k", readTime: "6 min read", imgSrc: "https://placehold.co/400x250/7DD3FC/0369a1?text=Bitcoin", link: "#" },
    { isFeatured: false, category: "Market News", title: "Oil Trading Strategy: OPEC+ Meeting Impact Analysis", summary: "Strategic insights for commodity traders as energy markets find equilibrium amid production quota discussions.", author: "Emma Williams", authorImg: "https://placehold.co/32x32/E0F2FE/0ea5e9?text=EW", date: "June 10, 2025", views: "1.2k", readTime: "7 min read", imgSrc: "https://placehold.co/400x250/38BDF8/0369a1?text=Oil+Trading", link: "#" },
];

const featuredArticle = articles.find(a => a.isFeatured);
const regularArticles = articles.filter(a => !a.isFeatured);
const filterButtons = ['All', 'Market News', 'Technical Analysis', 'Opinion Pieces', 'Stocks', 'Crypto', 'Forex'];

// --- Static Component ---
const BlogPage = () => {
    return (
        <>
            <main>
                {/* --- Header and Search/Filter Section (Visual Only) --- */}
                <section className="bg-white py-12 md:py-16">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 inline-block">
                                <span style={{ color: 'var(--text-black)' }}>Financial </span><span style={{ color: 'var(--primary-darker)' }}>News & Analysis</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-700">Stay ahead with timely market developments, expert analysis, and strategic insights tailored for your <strong className="font-semibold">trading</strong> journey.</p>
                        </div>
                        <div className="mt-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative flex-grow w-full">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                                </div>
                                <input 
                                    type="search" 
                                    id="blogSearchInput" 
                                    placeholder="Search financial news, trading strategies, and fintech insights..." 
                                    className="w-full pl-11 pr-4 py-2.5 rounded-md shadow-sm focus:outline-none focus:ring-2 border border-gray-400"
                                    readOnly // Makes the input non-interactive
                                />
                            </div>
                            <button className="px-4 py-2.5 rounded-md shadow-sm flex items-center justify-center whitespace-nowrap w-full sm:w-auto border border-gray-400">
                                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
                                Advanced Filters
                            </button>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3" id="filterButtonContainer">
                             {filterButtons.map((filterName, index) => (
                                <button 
                                    key={filterName}
                                    // The 'All' button is styled as active by default, others are neutral
                                    className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 border ${
                                        index === 0 
                                        ? 'bg-sky-600 text-white border-sky-600' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {filterName}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* --- Article Display Section --- */}
                <section className="pt-0 pb-4 md:pt-0 md:pb-6 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="p-3 rounded-lg mb-8 flex items-center shadow" style={{ backgroundColor: 'var(--danger-red-pale)' }}>
                            <span className="breaking-button relative inline-flex items-center text-white text-xs font-bold uppercase px-3 py-1 rounded-md mr-2" style={{ backgroundColor: 'var(--danger-red)' }}>
                                <span className="pulse"></span>BREAKING
                            </span>
                            <p className="text-sm flex-grow" style={{ color: 'var(--danger-red-dark)' }}>Market Alert: Major tech stocks surge 3% following AI partnership announcements. <Link to="#" className="font-semibold hover:underline" style={{ color: 'var(--danger-red)' }}>Read full analysis</Link></p>
                        </div>
                        
                        {/* Featured Article */}
                        {featuredArticle && (
                            <div className="article-card rounded-xl shadow-lg overflow-hidden mb-10 md:flex">
                                <div className="md:w-1/2">
                                    <Link to={featuredArticle.link}><LazyLoadImage src={featuredArticle.imgSrc} alt={featuredArticle.title} className="h-full w-full object-cover" effect="blur" /></Link>
                                </div>
                                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2 self-start bg-gray-100 text-gray-800 border">{featuredArticle.category}</span>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"><Link to={featuredArticle.link} className="hover:text-sky-600 transition">{featuredArticle.title}</Link></h2>
                                    <p className="text-sm md:text-base mb-4 text-gray-700">{featuredArticle.summary}</p>
                                    <div className="flex items-center text-xs text-gray-500 mb-4">
                                        <LazyLoadImage src={featuredArticle.authorImg} alt={featuredArticle.author} className="w-6 h-6 rounded-full mr-2" effect="blur" />
                                        <span>{featuredArticle.author}</span><span className="mx-2">|</span><span>{featuredArticle.date}</span><span className="mx-2">|</span>
                                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"/></svg>
                                        <span>{featuredArticle.views}</span><span className="mx-2">|</span><span>{featuredArticle.readTime}</span>
                                    </div>
                                    <Link to={featuredArticle.link} className="font-semibold py-2 px-6 rounded-lg text-center transition duration-300 self-start text-sm text-white bg-sky-500 hover:bg-sky-600">Read Full Article</Link>
                                </div>
                            </div>
                        )}
                        
                        {/* Regular Articles Grid - All articles are rendered */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="articlesGrid">
                            {regularArticles.map((article, index) => (
                                <div key={index} className="article-card bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                                    <Link to={article.link}><LazyLoadImage src={article.imgSrc} alt={article.title} className="h-48 w-full object-cover" effect="blur" /></Link>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="mb-3">
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full inline-block mr-2 bg-gray-100 text-gray-800 border">{article.category}</span>
                                            <span className="text-xs text-gray-500">{article.date}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2"><Link to={article.link} className="hover:text-sky-600 transition">{article.title}</Link></h3>
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
                
                {/* --- Static Subscription Form --- */}
                <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%)' }}>
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Never Miss Market Updates</h2>
                        <p className="text-lg text-gray-200 mb-8 max-w-xl mx-auto">Subscribe to our personalized newsletter and get breaking news, analysis, and strategies delivered to your inbox.</p>
                        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="flex-grow px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200" 
                                required 
                            />
                            <button type="submit" className="font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 whitespace-nowrap bg-white text-sky-600 hover:bg-sky-50">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
};

export default BlogPage;