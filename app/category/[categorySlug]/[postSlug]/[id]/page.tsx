/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Single Post Page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Converted generateStaticParams to an async function returning dummy data.
 * - WHY: Resolves Next.js 14 compiler crash for deeply nested dynamic segments failing parameter validation.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export async function generateStaticParams() {
    // Providing dummy parameters explicitly maps the 3 nested folders for the compiler.
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