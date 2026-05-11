/**
 * AI-CONTEXT:
 * Purpose: Next.js Server Component wrapper for Single Post page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Recreated natively in VS Code to enforce pure UTF-8 encoding.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

// Forces the static exporter to skip pre-rendering and rely on Client-Side routing
export function generateStaticParams() {
    return [
        {
            categorySlug: 'news',
            postSlug: 'latest-update',
            id: '1'
        }
    ];
}

export default function Page() {
    return <SinglePostPage />;
}