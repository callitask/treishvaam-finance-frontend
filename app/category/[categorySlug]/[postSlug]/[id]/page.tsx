/**
 * AI-CONTEXT:
 * Purpose: Next.js Server Component wrapper for Single Post page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Server component wrapper to allow generateStaticParams with static export.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

// This tells the compiler to skip pre-building this dynamic route
export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <SinglePostPage />;
}