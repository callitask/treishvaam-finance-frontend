/**
 * AI-CONTEXT:
 * Purpose: Public Entry Point (Root "/"). Next.js App Router.
 * Scope: 
 * - Strictly acts as a root redirector to consolidate SEO on the /home platform.
 * - The legacy landing page UI has been migrated to /login.
 * Critical Dependencies:
 * - next/navigation (redirect)
 * * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Removed 60/40 landing page UI and migrated it to app/login/page.tsx.
 * - EDITED: Implemented direct server-side redirect to /home.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
    redirect('/home');
}