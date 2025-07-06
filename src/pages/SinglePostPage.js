// src/pages/SinglePostPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, API_URL } from '../apiConfig'; // Import API_URL
import DOMPurify from 'dompurify';

const SinglePostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getPost(id);
                setPost(response.data);
            } catch (err) {
                setError('Failed to fetch post.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div className="text-center py-10">Loading post...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-10">Post not found.</div>;

    const createMarkup = (htmlContent) => {
        return { __html: DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } }) };
    };

    const coverImageStyle = {
        height: '400px',
        backgroundColor: '#f3f4f6',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // --- MODIFICATION START ---
        // Changed post.coverImageUrl to post.imageUrl to match backend model
        backgroundImage: `url(${API_URL}${post.imageUrl})`, 
        // --- MODIFICATION END ---
    };

    return (
        <article className="bg-gray-50">
            <header className="relative">
                <div style={coverImageStyle}>
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
            </header>
            <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
                    <p className="text-gray-500 mb-8">
                        Posted on {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div 
                        className="prose lg:prose-xl max-w-none"
                        dangerouslySetInnerHTML={createMarkup(post.content)}
                    >
                    </div>
                </div>
            </div>
        </article>
    );
};

export default SinglePostPage;
