// treishvaam-finance-frontend/src/pages/BlogPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../apiConfig';
import DOMPurify from 'dompurify';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// Note: If you haven't already, please install these required packages by running:
// npm install dompurify react-lazy-load-image-component

const allCategories = ['All', 'Stocks', 'Crypto', 'Trading', 'News'];

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
          try {
            const response = await getPosts();
            const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(sortedPosts);
          } catch (err) {
            setError('Failed to fetch blog posts.');
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
        fetchPosts();
    }, []);

    const filteredPosts = useMemo(() => {
        let filtered = posts;
        if (selectedCategory && selectedCategory !== "All") {
            // This assumes your post object has a 'category' property
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(term) ||
                (p.content && p.content.toLowerCase().includes(term))
            );
        }
        return filtered;
    }, [posts, selectedCategory, searchTerm]);

    const featuredArticle = filteredPosts.find(p => p.isFeatured) || (filteredPosts.length > 0 ? filteredPosts[0] : null);
    const regularArticles = filteredPosts.filter(p => p.id !== (featuredArticle ? featuredArticle.id : null));

    const createMarkup = (html) => {
        const cleanHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
        // This function is for dangerouslySetInnerHTML, so we return the object structure it expects.
        return { __html: cleanHtml.substring(0, 150) + '...' };
    };

    if (loading) return <div className="text-center p-10">Loading posts...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 inline-block">
                            <span style={{ color: 'var(--text-black, #111827)' }}>Financial </span>
                            <span style={{ color: 'var(--primary-darker, #0284c7)' }}>News & Analysis</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700">Stay ahead with timely market developments, expert analysis, and strategic insights tailored for your <strong className="font-semibold">trading</strong> journey.</p>
                    </div>
                </div>
            </section>

            <section className="bg-white pt-0 pb-0">
                <div className="container mx-auto px-6 flex flex-col items-center">
                    <form className="w-full max-w-3xl flex items-center gap-2 justify-center mb-2" onSubmit={e => e.preventDefault()}>
                        <div className="relative flex-grow">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                            </span>
                            <input type="text" placeholder="Search financial news..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input py-2.5 pl-10 pr-4 border border-black text-black w-full focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 text-sm rounded-none shadow-sm" />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-sky-500 text-white font-semibold hover:bg-sky-600 transition rounded-none">Search</button>
                    </form>
                    <div className="mt-0 mb-6 flex flex-wrap justify-center gap-2 md:gap-3">
                        {allCategories.map(cat => (
                            <button key={cat} className={`filter-button px-4 py-2 text-sm rounded-md transition-colors duration-200 border ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pt-0 pb-4 md:pt-0 md:pb-6 bg-white">
                <div className="container mx-auto px-6">
                    <div className="p-3 rounded-lg mb-8 flex items-center shadow" style={{ backgroundColor: 'var(--danger-red-pale, #fee2e2)' }}>
                        <span className="breaking-button relative inline-flex items-center text-white text-xs font-bold uppercase px-3 py-1 rounded-md mr-2" style={{ backgroundColor: 'var(--danger-red, #ef4444)' }}><span className="pulse"></span>BREAKING</span>
                        <p className="text-sm flex-grow" style={{ color: 'var(--danger-red-dark, #b91c1c)' }}>Market Alert: Major tech stocks surge 3% following AI partnership announcements. <Link to="#" className="font-semibold hover:underline" style={{ color: 'var(--danger-red, #ef4444)' }}>Read full analysis</Link></p>
                    </div>

                    {featuredArticle && (
                        <div className="rounded-xl shadow-lg overflow-hidden mb-10 md:flex" style={{maxHeight: '300px'}}>
                            <div className="md:w-1/2">
                                <Link to={`/blog/${featuredArticle.id}`}>
                                    <LazyLoadImage alt={featuredArticle.title} effect="blur" src={featuredArticle.postThumbnailUrl || `https://placehold.co/600x400/7DD3FC/0369a1?text=Featured`} className="h-full w-full object-cover" />
                                </Link>
                            </div>
                            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"><Link to={`/blog/${featuredArticle.id}`} className="hover:text-sky-600 transition">{featuredArticle.title}</Link></h2>
                                <div className="text-sm md:text-base mb-4 text-gray-700" dangerouslySetInnerHTML={createMarkup(featuredArticle.content)} />
                                <div className="flex items-center text-xs text-gray-500 mb-4">
                                    <span>{new Date(featuredArticle.createdAt).toLocaleDateString()}</span>
                                </div>
                                <Link to={`/blog/${featuredArticle.id}`} className="font-semibold py-2 px-6 rounded-lg text-center self-start text-sm text-white bg-sky-500 transition duration-300 hover:bg-sky-600">Read Full Article</Link>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {regularArticles.length > 0 ? (
                            regularArticles.map((article) => (
                                <div key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                                    <Link to={`/blog/${article.id}`}>
                                        <LazyLoadImage alt={article.title} effect="blur" src={article.postThumbnailUrl || `https://placehold.co/400x250/BAE6FD/0369a1?text=Thumbnail`} className="h-32 w-full object-cover" />
                                    </Link>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="text-md font-bold text-gray-900 mb-2 flex-grow"><Link to={`/blog/${article.id}`} className="hover:text-sky-600 transition">{article.title} </Link></h3>
                                        <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !featuredArticle && <div className="col-span-full text-center text-gray-500 py-12 text-lg">No articles found.</div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogPage;
