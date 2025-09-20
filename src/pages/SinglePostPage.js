// src/pages/SinglePostPage.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getPostBySlugAndId } from '../apiConfig'; // Import the new function
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import ShareButtons from '../components/ShareButtons';
import throttle from 'lodash/throttle';
import TableOfContents from '../components/TableOfContents';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const SinglePostPage = () => {
    const { userFriendlySlug, id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [progress, setProgress] = useState(0);
    const articleRef = useRef(null);

    // Fetch Post Data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getPostBySlugAndId(userFriendlySlug, id);
                setPost(response.data);
            } catch (err) {
                setError('Failed to fetch post.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        window.scrollTo(0, 0);
    }, [userFriendlySlug, id]);

    // Extract Headings and Add IDs
    useEffect(() => {
        if (!post?.content) return;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } });
        
        const headingElements = tempDiv.querySelectorAll('h2, h3, h4');
        const extractedHeadings = Array.from(headingElements).map((el, index) => {
            const id = `heading-${index}`;
            el.id = id;
            return { id, text: el.innerText, level: parseInt(el.tagName.substring(1), 10) };
        });

        setHeadings(extractedHeadings);
        setPost(currentPost => ({ ...currentPost, contentWithIds: tempDiv.innerHTML }));
    }, [post?.content]);
    
    // Handle Scroll for Progress Bar and Active Heading
    const handleScroll = useMemo(() => throttle(() => {
        const contentElement = articleRef.current;
        if (!contentElement) return;

        const articleTop = contentElement.getBoundingClientRect().top + window.scrollY;
        const contentHeight = contentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        const scrollableDistance = contentHeight - viewportHeight;
        const scrolledFromTop = window.scrollY - articleTop;
        
        if (scrolledFromTop > 0 && scrollableDistance > 0) {
            const scrollPercent = (scrolledFromTop / scrollableDistance) * 100;
            setProgress(Math.min(100, Math.max(0, scrollPercent)));
        } else {
            setProgress(0);
        }

        // Find Active Heading
        let currentActiveId = '';
        for (let i = headings.length - 1; i >= 0; i--) {
            const element = document.getElementById(headings[i].id);
            if (element && element.getBoundingClientRect().top < 200) {
                currentActiveId = headings[i].id;
                break;
            }
        }
        setActiveId(currentActiveId);
    }, 150), [headings]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            handleScroll.cancel();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    if (loading) return <div className="text-center py-20">Loading post...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-20">Post not found.</div>;

    const createMarkup = (htmlContent) => ({ __html: htmlContent });
    
    return (
        <>
            <Helmet>
                <title>{`Treishvaam Finance · ${post?.title || 'Blog Post'}`}</title>
            </Helmet>

            <div className="max-w-screen-xl mx-auto lg:grid lg:grid-cols-12 lg:gap-x-12 px-4 sm:px-6 lg:px-8">
                {/* --- LEFT (MAIN) COLUMN: SCROLLS --- */}
                <div className="lg:col-span-8 xl:col-span-9 py-8">
                    <header className="mb-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center text-sm text-gray-500 mt-4 mb-6">
                            <span>By {post.authorName || 'Treishvaam Team'}</span>
                            <span className="mx-2">·</span>
                            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                        </div>
                        
                        {/* --- COVER IMAGE MOVED HERE --- */}
                        {post.coverImageUrl && (
                            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                                <ResponsiveAuthImage imageName={post.coverImageUrl} alt={post.title} className="w-full h-auto object-cover"/>
                            </div>
                        )}
                    </header>
                    
                    <main ref={articleRef}>
                        <article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={createMarkup(post.contentWithIds || post.content)} />
                        
                        <div className="mt-16 pt-8 border-t">
                            <ShareButtons url={`/blog/${userFriendlySlug}/${id}`} title={post.title} />
                        </div>
                    </main>
                </div>

                {/* --- RIGHT (ASIDE) COLUMN: STICKY --- */}
                <aside className="lg:col-span-4 xl:col-span-3 py-8 hidden lg:block">
                    <div className="sticky top-24">
                         <TableOfContents 
                            headings={headings} 
                            activeId={activeId} 
                            progress={progress} 
                         />
                    </div>
                </aside>
            </div>
        </>
    );
}

export default SinglePostPage;