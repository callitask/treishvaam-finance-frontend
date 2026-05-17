"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for new Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Fixed UTF encoding via script.
 * - EDITED: Converted page component to dynamic import with ssr: false.
 * - Why: Resolved BUG-04 (React Error #425 hydration mismatch) due to Tiptap requiring DOM to initialize.
 * - Date: 2026-05-17 (Phase 1 Fixes)
 */
import dynamic from 'next/dynamic';

const BlogEditorPage = dynamic(
    () => import('../../../../src/pages/BlogEditorPage'),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 uppercase tracking-widest">Loading Editor...</p>
                </div>
            </div>
        )
    }
);

export default function Page() {
    return <BlogEditorPage />;
}