/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Generates the OpenSearch Description XML manifest for the Finance platform.
 *
 * Scope:
 * - Browser integration: Allows Chrome/Edge users to tab-search directly from the address bar.
 * - AI integration: Allows AI agents/plugins to natively query the platform's search vectors.
 *
 * Critical Dependencies:
 * - Frontend: layout.tsx must link to this route via `<link rel="search">`.
 * - Network: Edge runtime compatible.
 *
 * Security Constraints:
 * - Public metadata only.
 * - Must execute securely on Cloudflare Edge Runtime.
 *
 * Non-Negotiables:
 * - Must conform strictly to the OpenSearch 1.1 specification.
 *
 * Change Intent:
 * - Added to expand the platform's digital footprint into browser-native and AI-native search layers.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • OpenSearch XML generation route handler.
 * • Created to finalize the "Maximum Digital Footprint" mandate, ensuring AI agents and browsers can directly index the internal search engine.
 * • Phase: GEO Integration Finalization.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions. 
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Treishvaam Finance</ShortName>
  <Description>Search global financial news, proprietary market data, and expert analysis.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Url type="text/html" template="https://treishvaamfinance.com/search?q={searchTerms}"/>
  <Url type="application/opensearchdescription+xml" rel="self" template="https://treishvaamfinance.com/opensearch.xml"/>
  <Image width="16" height="16" type="image/x-icon">https://treishvaamfinance.com/favicon.ico</Image>
</OpenSearchDescription>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/opensearchdescription+xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000',
        },
    });
}