
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Helmet } from 'react-helmet-async';

// ... createSnippet, formatDateTime, and PostCard components ...

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // ... useEffect and useMemo hooks ...

    if (loading) return <div className="text-center p-10">Loading posts...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <Helmet>
                <title>Financial News & Analysis Blog | Treishfin</title>
                <meta name="description" content="Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance. Your source for insights on stocks, crypto, and trading." />
                <meta name="keywords" content="financial news, latest news, market updates, stock analysis, crypto news, trading insights, Treishvaam, Treishvaam Finance" />
                <meta property="og:title" content="Financial News & Analysis Blog | Treishfin" />
                <meta property="og:description" content="Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance." />
                <meta property="og:url" content="https://treishfin.treishvaamgroup.com/blog" />
                <meta property="og:image" content="https://treishfin.treishvaamgroup.com/logo512.png" />
                <meta property="og:type" content="website" />
            </Helmet>

            <section className="bg-white py-12 md:py-16">
                 {/* ... Rest of your BlogPage JSX ... */}
            </section>

            <section className="bg-white pt-0 pb-12">
                 {/* ... Rest of your BlogPage JSX ... */}
            </section>
        </>
    );
};

export default BlogPage;