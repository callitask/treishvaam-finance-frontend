/**
 * Enterprise Schema Generator
 * Generates JSON-LD structured data following Google's "NewsArticle", "BlogPosting", and "VideoObject" guidelines.
 */

export const generatePostSchema = (post, authorName, pageUrl, imageUrl) => {
    if (!post) return null;

    const categoryName = post.category?.name || "General";

    // Determine Schema Type: News vs Blog
    const isNews = ['News', 'Markets', 'Crypto', 'Economy', 'Stocks'].includes(categoryName);
    const schemaType = isNews ? 'NewsArticle' : 'BlogPosting';

    const seoDescription = post.metaDescription || post.customSnippet || post.title;

    // 1. Breadcrumb Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "name": "Breadcrumbs",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://treishfin.treishvaamgroup.com/"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": `https://treishfin.treishvaamgroup.com/category/${post.category?.slug || 'general'}`
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": pageUrl
        }]
    };

    // 2. Article Schema
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
        },
        "headline": post.title,
        "image": {
            "@type": "ImageObject",
            "url": imageUrl,
            "width": 1200,
            "height": 675
        },
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
        "author": {
            "@type": "Person",
            "name": authorName,
            "url": "https://treishfin.treishvaamgroup.com/about",
            "jobTitle": "Financial Analyst"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Treishvaam Finance",
            "logo": {
                "@type": "ImageObject",
                "url": "https://treishfin.treishvaamgroup.com/logo.webp",
                "width": 600,
                "height": 60
            }
        },
        "description": seoDescription,
        "keywords": post.keywords || "",
        "articleBody": post.customSnippet || "",
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".prose > p:first-of-type"]
        }
    };

    const schemas = [breadcrumbSchema, articleSchema];

    // 3. Video Object Schema (Auto-Detection)
    const videoRegex = /src="https:\/\/(?:www\.)?youtube\.com\/embed\/([^"?]+)/;
    const match = post.content ? post.content.match(videoRegex) : null;

    if (match && match[1]) {
        const videoId = match[1];
        const videoSchema = {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": post.title,
            "description": seoDescription,
            "thumbnailUrl": imageUrl,
            "uploadDate": post.createdAt,
            "embedUrl": `https://www.youtube.com/embed/${videoId}`,
            "contentUrl": `https://www.youtube.com/watch?v=${videoId}`
        };
        schemas.push(videoSchema);
    }

    return schemas;
};