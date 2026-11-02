import DOMPurify from 'dompurify';

export const categoryStyles = {
    "Stocks": "text-sky-700",
    "Crypto": "text-sky-700",
    "Trading": "text-sky-700",
    "News": "text-sky-700",
    "Default": "text-sky-700"
};

export const createSnippet = (html, length = 155) => {
    if (!html) return '';
    const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], FORBID_ATTR: ['style'] });
    if (plainText.length <= length) return plainText;
    const trimmed = plainText.substring(0, length);
    return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
};

export const formatDateTime = (dateString) => {
    if (!dateString) return { isNew: false, displayDate: 'Date not available' };
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return { isNew: false, displayDate: 'Date not available' };
    const now = new Date();
    const diffHours = (now - dateObj) / (1000 * 60 * 60);
    const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(dateObj);
    return { isNew: diffHours < 48, displayDate };
};


/**
 * Resolves the primary media URL for any post in exact priority order:
 * 1. First valid (non-empty, non-[object Object]) article.thumbnails?.[0]?.imageUrl
 * 2. Valid article.coverImageUrl (non-empty, non-[object Object])
 * 3. In-content video/source regex match (excluding [object Object])
 */
export const resolvePostMediaUrl = (article) => {
    if (!article) return '';

    // 1. First valid thumbnail
    const thumbUrl = article.thumbnails?.[0]?.imageUrl;
    if (thumbUrl && typeof thumbUrl === 'string' && !thumbUrl.includes('[object Object]') && thumbUrl.trim() !== '') {
        return thumbUrl.trim();
    }

    // 2. Valid coverImageUrl
    const coverUrl = article.coverImageUrl;
    if (coverUrl && typeof coverUrl === 'string' && !coverUrl.includes('[object Object]') && coverUrl.trim() !== '') {
        return coverUrl.trim();
    }

    // 3. In-content video/source extraction
    if (article.content && typeof article.content === 'string') {
        const videoMatch = article.content.match(/<video[^>]+(?:src|data-src)=["']([^"']+)["']/i) ||
                           article.content.match(/<source[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        if (videoMatch && videoMatch[1] && !videoMatch[1].includes('[object Object]')) {
            return videoMatch[1].trim();
        }

        const imgMatch = article.content.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1] && !imgMatch[1].includes('[object Object]')) {
            return imgMatch[1].trim();
        }
    }

    return '';
};
