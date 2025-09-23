import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getPostByUrlId, API_URL } from '../apiConfig';
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

const createSnippet = (html, length = 155) => {
    if (!html) return '';
    const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    if (plainText.length <= length) return plainText;
    const trimmed = plainText.substring(0, length);
    return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
};

const SinglePostPage = () => {
    // Corrected to only extract the used parameter
    const { urlArticleId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [progress, setProgress] = useState(0);
    const articleRef = useRef(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getPostByUrlId(urlArticleId);
                setPost(response.data);
            } catch (err) {
                setError('Failed to fetch post.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        window.scrollTo(0, 0);
    }, [urlArticleId]);

    useEffect(() => {
        if (!post?.content) return;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true }, ADD_ATTR: ['id'] });
        
        const headingElements = tempDiv.querySelectorAll('h2, h3, h4');
        const extractedHeadings = Array.from(headingElements).map((el, index) => {
            const id = `heading-${index}-${el.tagName}`;
            el.id = id;
            return { id, text: el.innerText, level: parseInt(el.tagName.substring(1), 10) };
        });

        setHeadings(extractedHeadings);
        setPost(currentPost => ({ ...currentPost, contentWithIds: tempDiv.innerHTML }));
    }, [post?.content]);
    
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

    const pageUrl = `https://treishfin.treishvaamgroup.com/blog/category/${post.category?.slug}/${post.userFriendlySlug}/${post.urlArticleId}`;
    const pageTitle = `Treishvaam Finance · ${post.title}`;
    const seoDescription = post.metaDescription || post.customSnippet || createSnippet(post.content, 155);
    const imageUrl = post.coverImageUrl ? `${API_URL}/api/uploads/${post.coverImageUrl}.webp` : `${window.location.origin}/logo512.png`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "image": imageUrl,
        "author": {
            "@type": "Organization",
            "name": "Treishvaam Finance"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Treishvaam Finance",
            "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/logo512.png`
            }
        },
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
        },
        "description": seoDescription,
        "keywords": post.keywords || post.tags?.join(', ')
    };

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={seoDescription} />
                {post.keywords && <meta name="keywords" content={post.keywords} />}
                <link rel="canonical" href={pageUrl} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={imageUrl} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={pageUrl} />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={imageUrl} />
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            </Helmet>

            <div className="max-w-screen-xl mx-auto lg:grid lg:grid-cols-12 lg:gap-x-12 px-4 sm:px-6 lg:px-8">
                <div className="lg:col-span-8 xl:col-span-9 py-8">
                    <header className="mb-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center text-sm text-gray-500 mt-4 mb-6">
                            <span>By {post.author || 'Treishvaam Team'}</span>
                            <span className="mx-2">·</span>
                            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                        </div>
                        
                        {post.coverImageUrl && (
                            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                                <ResponsiveAuthImage baseName={post.coverImageUrl} alt={post.coverImageAltText || post.title} className="w-full h-auto object-cover"/>
                            </div>
                        )}
                    </header>
                    
                    <main ref={articleRef}>
                        <article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={createMarkup(post.contentWithIds || post.content)} />
                        
                        <div className="mt-16 pt-8 border-t">
                            <ShareButtons url={pageUrl} title={post.title} />
                        </div>
                    </main>
                </div>

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