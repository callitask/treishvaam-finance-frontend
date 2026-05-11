/**
 * AI-CONTEXT:
 * Purpose: Next.js Server Component wrapper for editing existing Blog posts.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Recreated natively in VS Code to enforce pure UTF-8 encoding.
 */
import BlogEditorPage from '../../../../../../src/pages/BlogEditorPage';

// Forces the static exporter to skip pre-rendering and rely on Client-Side routing
export function generateStaticParams() {
    return [
        {
            userFriendlySlug: 'edit',
            id: '1'
        }
    ];
}

export default function Page() {
    return <BlogEditorPage />;
}