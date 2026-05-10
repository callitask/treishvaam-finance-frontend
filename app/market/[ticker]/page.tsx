"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router dynamic wrapper for the Market Detail page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Resolves 404/redirect to Home when clicking a ticker on the Live Site.
 */
import MarketDetailPage from '../../../src/pages/MarketDetailPage';
export default function Page() { return <MarketDetailPage />; }