/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Single Post Page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Added `export` keyword to `generateStaticParams` to ensure Next.js correctly registers the static bypass during `output: export`.
 */
import SinglePostPage from '../../../../../src/pages/SinglePostPage';

export function generateStaticParams() {
    return [];
}

export default function Page() {
    return <SinglePostPage />;
}