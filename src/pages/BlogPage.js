import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const articles = [
    { isFeatured: true, category: "Market News", title: "Federal Reserve Signals Potential Rate Cut in Q3", summary: "Central bank officials hint at monetary policy adjustments following recent inflation data, providing critical insights for active traders...", author: "Sarah Johnson", authorImg: "https://placehold.co/32x32/E0F2FE/0369a1?text=SJ", date: "June 11, 2025", views: "2.1k", readTime: "5 min read", imgSrc: "https://placehold.co/600x400/7DD3FC/0369a1?text=Featured+Analysis", link: "#" },
    { isFeatured: false, category: "Technical Analysis", title: "Advanced Technical Analysis: AI-Driven Trading Patterns", summary: "Expert analysis of emerging AI-driven trading patterns and their implications for sophisticated trading strategies.", author: "Michael Chen", authorImg: "https://placehold.co/32x32/E0F2FE/0284c7?text=MC", date: "June 11, 2025", views: "1.8k", readTime: "8 min read", imgSrc: "https://placehold.co/400x250/BAE6FD/0369a1?text=AI+Trading", link: "#" },
    { isFeatured: false, category: "Crypto", title: "Bitcoin Strategy: Breaking $45,000 Resistance Analysis", summary: "Detailed strategy analysis for crypto traders as Bitcoin demonstrates renewed strength with institutional adoption continuing...", author: "David Rodriguez", authorImg: "https://placehold.co/32x32/BAE6FD/0284c7?text=DR", date: "June 10, 2025", views: "3.1k", readTime: "6 min read", imgSrc: "https://placehold.co/400x250/7DD3FC/0369a1?text=Bitcoin", link: "#" },
    { isFeatured: false, category: "Market News", title: "Oil Trading Strategy: OPEC+ Meeting Impact Analysis", summary: "Strategic insights for commodity traders as energy markets find equilibrium amid production quota discussions.", author: "Emma Williams", authorImg: "https://placehold.co/32x32/E0F2FE/0ea5e9?text=EW", date: "June 10, 2025", views: "1.2k", readTime: "7 min read", imgSrc: "https://placehold.co/400x250/38BDF8/0369a1?text=Oil+Trading", link: "#" },
];

// Manually define all categories you want to show as filter tabs
const categories = [
    "All",
    "Market News",
    "Technical Analysis",
    "Crypto",
    // Add more categories here as needed, e.g.:
    // "Commodities",
    // "Forex",
    // "Personal Finance",
];

function filterArticles(articles, selectedCategory, searchTerm) {
    let filtered = articles;
    if (selectedCategory && selectedCategory !== "All") {
        filtered = filtered.filter(a => a.category === selectedCategory);
    }
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(term) ||
            a.summary.toLowerCase().includes(term)
        );
    }
    return filtered;
}


const BlogPage = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredArticles = filterArticles(articles, selectedCategory, searchTerm);
    const featuredArticle = filteredArticles.find(a => a.isFeatured);
    const regularArticles = filteredArticles.filter(a => !a.isFeatured);

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

            {/* Search bar and filter section (styled as per provided HTML) */}
            <section className="bg-white pt-0 pb-0">
                <div className="container mx-auto px-6 flex flex-col items-center">
                    <form
                        className="w-full max-w-3xl flex items-center gap-2 justify-center mb-2"
                        onSubmit={e => { e.preventDefault(); }}
                    >
                        <div className="relative flex-grow">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search financial news, trading strategies, and fintech insights..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="search-input py-2.5 pl-10 pr-4 border border-black text-black w-full focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 text-sm rounded-none shadow-sm"
                                style={{ borderRadius: 0 }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-sky-500 text-white font-semibold hover:bg-sky-600 transition rounded-none"
                            style={{ borderRadius: 0 }}
                        >
                            Search
                        </button>
                    </form>
                    <div className="mt-0 mb-6 flex flex-wrap justify-center gap-2 md:gap-3" id="filterButtonContainer">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-button px-4 py-2 text-sm rounded-md transition-colors duration-200 border ${selectedCategory === cat ? 'active' : ''}`}
                                style={{ backgroundColor: selectedCategory === cat ? 'var(--primary-button)' : 'white', color: selectedCategory === cat ? 'white' : 'var(--text-black)', borderColor: selectedCategory === cat ? 'var(--primary-button)' : 'var(--border-light-gray)' }}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
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
                        {regularArticles.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-12 text-lg">No articles found.</div>
                        ) : (
                            regularArticles.map((article, index) => (
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
                            ))
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogPage;
