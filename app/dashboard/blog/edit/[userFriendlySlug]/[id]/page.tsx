/**
 * AI-CONTEXT:
 * Purpose: Next.js Server Component wrapper for editing existing Blog posts.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Server component wrapper to allow generateStaticParams with static export.
 */
import BlogEditorPage from '../../../../../../src/pages/BlogEditorPage';

// This tells the compiler to skip pre-building this dynamic route
export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <BlogEditorPage />;
}