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
    const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
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
    const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(dateObj);
    return { isNew: diffHours < 48, displayDate };
};
