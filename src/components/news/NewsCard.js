import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const NewsCard = ({ article }) => {
    // Phase 18: Normalize Data Fields (CamelCase from Backend)
    const imageUrl = article.imageUrl || article.image_url || '/logo.webp'; // Fallback
    const title = article.title;
    const description = article.description || "Read the full story for more details.";
    const link = article.link;
    const publishedAt = article.publishedAt || article.published_at;

    // Format Source (e.g., "bloomberg" -> "Bloomberg")
    const sourceName = article.source
        ? article.source.charAt(0).toUpperCase() + article.source.slice(1).replace(/_/g, ' ')
        : 'News';

    const timeAgo = publishedAt ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true }) : 'Just now';

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 h-full flex flex-col"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                <LazyLoadImage
                    alt={title}
                    src={imageUrl}
                    effect="blur"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/logo.webp'; }} // Safety fallback
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                    {sourceName}
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-sky-600 dark:text-sky-400">{sourceName}</span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-grow">
                    {description}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Read Analysis &rarr;</span>
                </div>
            </div>
        </a>
    );
};

export default NewsCard;