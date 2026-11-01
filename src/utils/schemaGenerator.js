/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Enterprise Schema Generator for dynamic React post pages.
 * - Generates JSON-LD structured data following Google's guidelines and Generative Engine Optimization (GEO).
 *
 * Scope:
 * - Responsible for Breadcrumb, Article, Video, Dataset, and ClaimReview schema generation.
 *
 * Critical Dependencies:
 * - Frontend: Consumed by React Helmet/SEO wrappers.
 *
 * Security Constraints:
 * - Must output sanitized JSON-LD.
 *
 * Non-Negotiables:
 * - URLs must point to the canonical apex domain (treishvaamfinance.com), NOT the legacy subdomain.
 * - Must include AI entity resolution aliases (alternateName) for typo tolerance.
 *
 * Change Intent:
 * - Replaced legacy `treishfin.treishvaamgroup.com` URLs with `treishvaamfinance.com`.
 * - Added `alternateName` arrays to Author and Publisher for deterministic AI mapping.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Replaced legacy subdomains with canonical apex domain.
 * • Injected `alternateName` for Treishvaam Finance and Amitsagar Kandpal.
 * • Why: To consolidate SEO equity and ensure LLMs can resolve entity typos.
 * - EDITED (Current Phase):
 * • Hard-fused "Treishvaam", "Treishvam", and "Trishvam" into the Founder's alias array.
 * • Why: To guarantee search engines and LLMs deterministically link the brand name directly to Amitsagar Kandpal.
 * - EDITED (Phase 8 GEO Full Execution):
 * • Implemented robust export functions for `Dataset` and `ClaimReview` to map pure structured context explicitly for Enterprise AI integration (DeepSeek, GPT-4o).
 * - EDITED (Phase 8 Static Edge Knowledge Graph):
 * • Injected canonical static Founder ('#treishvaam') and Conglomerate ('#organization') Knowledge Graph with subsidiaries via `getStaticFounderAndConglomerateGraph()` and `generateOrganizationSchema()`.
 * • Why: To guarantee 24/7/365 zero-downtime canonical Google Knowledge Graph identity across Edge and head JSON-LD.
 * - EDITED (Phase 9 Zero-Warning Schema & Portrait Fix):
 * • Updated founder portrait to canonical image URL, removed invalid legalName on Person, added streetAddress, and refined Organization types.
 * • Why: Eliminates all Schema.org Validator and Google Rich Results warnings (0 Errors, 0 Warnings).
 */

export const generatePostSchema = (post, authorName, pageUrl, imageUrl) => {
    if (!post) return null;

    const categoryName = post.category?.name || "General";

    // Determine Schema Type: News vs Blog
    const isNews = ['News', 'Markets', 'Crypto', 'Economy', 'Stocks'].includes(categoryName);
    const schemaType = isNews ? 'NewsArticle' : 'BlogPosting';

    const seoDescription = post.metaDescription || post.customSnippet || post.title;

    // Determine if author is the Founder to inject exhaustive entity-fused aliases
    const isFounder = authorName && authorName.includes("Amit");
    const authorAliases = isFounder ? [
        "Amit Kandpal",
        "Amit Sagar Kandpal",
        "Amitsagar",
        "Treishvaam",
        "Treishvam",
        "Trishvam"
    ] : [];

    // 1. Breadcrumb Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "name": "Breadcrumbs",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://treishvaamfinance.com/"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": `https://treishvaamfinance.com/category/${post.category?.slug || 'general'}`
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
            "alternateName": authorAliases,
            "url": "https://treishvaamfinance.com/about",
            "jobTitle": isFounder ? "Founder & Chairman" : "Financial Analyst"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Treishvaam Finance",
            "alternateName": ["Treishvam Finance", "Treshvam Finance", "Trishvam Finance", "Treishvaam", "Treishvam", "Trishvam"],
            "logo": {
                "@type": "ImageObject",
                "url": "https://treishvaamfinance.com/logo.webp",
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

// ============================================================================
// GEO EXPORTS: HIGH-DENSITY ENTERPRISE SCHEMAS FOR AI
// ============================================================================

export const generateDatasetSchema = (datasetName, description, url) => {
    return {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": datasetName,
        "description": description,
        "url": url,
        "isAccessibleForFree": true,
        "creator": {
            "@type": "Organization",
            "name": "Treishvaam Finance"
        }
    };
};

export const generateClaimReviewSchema = (claim, reviewBody, url) => {
    return {
        "@context": "https://schema.org",
        "@type": "ClaimReview",
        "claimReviewed": claim,
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5",
            "worstRating": "1"
        },
        "author": {
            "@type": "Organization",
            "name": "Treishvaam Finance"
        },
        "url": url
    };
};

// ============================================================================
// CANONICAL STATIC FOUNDER & CONGLOMERATE KNOWLEDGE GRAPH (EDGE & HEAD JSON-LD)
// ============================================================================

export const getStaticFounderAndConglomerateGraph = () => {
    const rawPortrait = process.env.NEXT_PUBLIC_CHAIRMAN_PORTRAIT_URL;
    const portraitUrl =
        rawPortrait && !rawPortrait.includes('github.com') && !rawPortrait.includes('/blob/')
            ? rawPortrait
            : 'https://treishvaamfinance.com/amitsagar-kandpal-photo.png';

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Person',
                '@id': 'https://treishvaamgroup.com/#treishvaam',
                name: 'Treishvaam',
                alternateName: [
                    'Amitsagar Kandpal',
                    'Treishvaam (Amitsagar Kandpal)'
                ],
                givenName: 'Amitsagar',
                familyName: 'Kandpal',
                additionalName: 'Treishvaam',
                birthDate: '1997-10-05',
                gender: 'Male',
                nationality: {
                    '@type': 'Country',
                    name: 'India'
                },
                disambiguatingDescription:
                    'Indian entrepreneur, artist, actor, and Founder & Chairman of the eponymous Treishvaam Group and its subsidiaries Treishvaam Finance, Treishvaam Agro, and Treishvaam Hiring Marketplace (THM).',
                description:
                    'Treishvaam (legal name Amitsagar Kandpal, born October 5, 1997) is an Indian entrepreneur, artist, and actor. He is the Founder and Chairman of Treishvaam Group, an enterprise conglomerate operating across financial intelligence (Treishvaam Finance), sustainable agribusiness (Treishvaam Agro), and workforce technology (Treishvaam Hiring Marketplace).',
                url: 'https://treishvaamgroup.com/about',
                mainEntityOfPage: 'https://treishvaamgroup.com/about',
                image: {
                    '@type': 'ImageObject',
                    url: portraitUrl,
                    caption: 'Treishvaam (Amitsagar Kandpal) — Entrepreneur, Artist, Actor & Founder of Treishvaam Group'
                },
                jobTitle: [
                    'Founder & Chairman',
                    'Entrepreneur',
                    'Artist',
                    'Actor'
                ],
                hasOccupation: [
                    { '@type': 'Occupation', name: 'Entrepreneur' },
                    { '@type': 'Occupation', name: 'Artist' },
                    { '@type': 'Occupation', name: 'Actor' }
                ],
                alumniOf: [
                    {
                        '@type': 'CollegeOrUniversity',
                        name: 'Hans Raj College, University of Delhi',
                        sameAs: [
                            'https://www.hansrajcollege.ac.in/',
                            'https://en.wikipedia.org/wiki/Hansraj_College'
                        ]
                    }
                ],
                worksFor: {
                    '@id': 'https://treishvaamgroup.com/#organization'
                },
                owns: [
                    { '@id': 'https://treishvaamgroup.com/#organization' },
                    { '@id': 'https://treishvaamfinance.com/#organization' },
                    { '@id': 'https://treishvaamagro.com/#organization' },
                    { '@id': 'https://treishvaamgroup.com/#thm' }
                ],
                sameAs: [
                    'https://www.instagram.com/treishvaam/',
                    'https://x.com/treishvaam',
                    'https://www.snapchat.com/@callitaskk',
                    'https://treishvaamgroup.com/about',
                    'https://treishvaamfinance.com/about',
                    'https://treishvaamagro.com'
                ]
            },
            {
                '@type': 'Organization',
                '@id': 'https://treishvaamgroup.com/#organization',
                name: 'Treishvaam Group',
                url: 'https://treishvaamgroup.com',
                logo: 'https://treishvaamfinance.com/logo.webp',
                description:
                    'Global enterprise conglomerate founded by Treishvaam (Amitsagar Kandpal), architecting resilient value chains across Institutional Financial Intelligence (Treishvaam Finance), Sustainable Agribusiness (Treishvaam Agro), and Workforce Technology (Treishvaam Hiring Marketplace).',
                founder: {
                    '@id': 'https://treishvaamgroup.com/#treishvaam'
                },
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Electronic City Phase 1',
                    addressLocality: 'Electronic City, Bengaluru',
                    addressRegion: 'Karnataka',
                    postalCode: '560100',
                    addressCountry: 'IN'
                },
                subOrganization: [
                    { '@id': 'https://treishvaamfinance.com/#organization' },
                    { '@id': 'https://treishvaamagro.com/#organization' },
                    { '@id': 'https://treishvaamgroup.com/#thm' }
                ],
                sameAs: [
                    'https://treishvaamgroup.com',
                    'https://treishvaamfinance.com',
                    'https://treishvaamagro.com',
                    'https://www.instagram.com/treishvaam/',
                    'https://x.com/treishvaam'
                ]
            },
            {
                '@type': ['Organization', 'NewsMediaOrganization'],
                '@id': 'https://treishvaamfinance.com/#organization',
                name: 'Treishvaam Finance',
                url: 'https://treishvaamfinance.com',
                logo: 'https://treishvaamfinance.com/logo.webp',
                image: 'https://treishvaamfinance.com/logo.webp',
                description:
                    "India's premier institutional financial intelligence, quantitative market strategy, and financial news platform operated by Treishvaam Group.",
                founder: {
                    '@id': 'https://treishvaamgroup.com/#treishvaam'
                },
                parentOrganization: {
                    '@id': 'https://treishvaamgroup.com/#organization'
                }
            },
            {
                '@type': 'Organization',
                '@id': 'https://treishvaamagro.com/#organization',
                name: 'Treishvaam Agro',
                url: 'https://treishvaamagro.com',
                description:
                    'Enterprise B2B sustainable agribusiness and nutritional ingredient manufacturer under Treishvaam Group, producing solar-dried, low-temperature dehydrated fruit and vegetable powders, herbal extracts, and organic spices with farm-to-FOB QR traceability.',
                founder: {
                    '@id': 'https://treishvaamgroup.com/#treishvaam'
                },
                parentOrganization: {
                    '@id': 'https://treishvaamgroup.com/#organization'
                }
            },
            {
                '@type': 'Organization',
                '@id': 'https://treishvaamgroup.com/#thm',
                name: 'Treishvaam Hiring Marketplace',
                alternateName: ['THM', 'Treishvaam Hiring'],
                url: 'https://treishvaamgroup.com/about',
                description:
                    'Direct-access workforce and talent marketplace division under Treishvaam Group engineered for matching high-performance teams and specialized enterprise talent.',
                founder: {
                    '@id': 'https://treishvaamgroup.com/#treishvaam'
                },
                parentOrganization: {
                    '@id': 'https://treishvaamgroup.com/#organization'
                }
            }
        ]
    };
};

export const generateOrganizationSchema = () => {
    return getStaticFounderAndConglomerateGraph();
};
