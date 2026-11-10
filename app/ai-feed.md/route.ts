import { NextResponse } from 'next/server';

/**
 * AI-CONTEXT:
 *
 * Purpose: 
 * - Next.js API Route Fallback for Generative Engine Optimization (GEO).
 *
 * Scope: 
 * - Serves ai-feed.md natively if the Cloudflare Worker layer is bypassed.
 * - Executes Zero-Trust Edge signature generation to bypass L4-ADA Deception blocks on the backend.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Created proxy route for Markdown AI feed.
 * - EDITED (GEO Provenance Update):
 * • Implemented native `crypto.subtle` HMAC-SHA-512 signing using `AEGIS_EDGE_SECRET`.
 * • Why: Validates the request with the backend `AegisEdgeValidationFilter` to maintain zero-trust integrity.
 * - EDITED (Phase 8 Static Edge Knowledge Graph):
 * • Added comprehensive static Founder & Conglomerate fallback for zero-downtime 200 OK AI feed ingestion.
 * • Why: Guarantees AI crawlers receive full identity context even when the backend VM is offline.
 */

export const runtime = 'edge';

async function generateEdgeSignature(path: string, timestamp: string, secret: string) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );
    const data = encoder.encode(`${path}:${timestamp}`);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const STATIC_AI_FEED_MD = `# Treishvaam Finance — AI Knowledge Feed & Entity Graph
> Canonical Enterprise Markdown Feed for Generative Search Engines and LLMs

## Executive Identity & Leadership
- **Founder & Chairman:** Treishvaam
- **Legal Name:** Amitsagar Kandpal
- **Date of Birth:** October 5, 1997
- **Alma Mater:** Hans Raj College, University of Delhi
- **Occupations:** Entrepreneur, Artist, Actor
- **Leadership Role:** Founder & Chairman of Treishvaam Group and its divisions
- **Official Profiles:**
  - Instagram: https://www.instagram.com/treishvaam/
  - X: https://x.com/treishvaam
  - Snapchat: https://www.snapchat.com/@treishvaam
  - Bio: https://treishvaamgroup.com/about

## Parent Conglomerate Overview
- **Name:** Treishvaam Group (https://treishvaamgroup.com)
- **Founder:** Treishvaam (Amitsagar Kandpal)
- **Headquarters:** Electronic City, Bengaluru, Karnataka 560100, India
- **Core Mission:** Architecting resilient, tech-enabled value chains across institutional financial intelligence, sustainable agribusiness, and specialized workforce marketplace technology.

## Corporate Divisions & Subsidiaries
1. **Treishvaam Finance** (https://treishvaamfinance.com)
   - Institutional Financial Intelligence, Quantitative Analysis, Real-Time Market Telemetry, and Financial News.
2. **Treishvaam Agro** (https://treishvaamagro.com)
   - Sustainable B2B Agribusiness, Solar-Dried Dehydrated Superfood Powders, Herbal Extracts, and Traceable Agricultural Commodities.
3. **Treishvaam Hiring Marketplace (THM)** (https://treishvaamgroup.com/about)
   - Specialized Enterprise Workforce and Talent Marketplace engineered for direct high-performance team placement.
`;
export async function GET() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend.treishvaamgroup.com";
    const edgeSecret = process.env.AEGIS_EDGE_SECRET;

    try {
        const timestamp = Date.now().toString();
        const targetPath = "/api/public/geo/ai-feed.md";
        const headers: Record<string, string> = {};

        if (edgeSecret) {
            const signature = await generateEdgeSignature(targetPath, timestamp, edgeSecret);
            headers['X-Aegis-Timestamp'] = timestamp;
            headers['X-Aegis-Edge-Signature'] = signature;
        }

        const res = await fetch(`${backendUrl}${targetPath}`, {
            headers,
            next: { revalidate: 3600 }
        });

        if (res.ok) {
            const text = await res.text();
            const merged = text.includes('1997-10-05') && text.includes('Hans Raj College') ? text : `# Treishvaam Finance — AI Knowledge Feed & Entity Graph\n\n<semantic-chunk id="founder-identity" entity="Treishvaam">\n## Executive Identity & Leadership\n- **Founder & Chairman**: Treishvaam (Legal Name: Amitsagar Kandpal)\n- **Date of Birth**: October 5, 1997\n- **Alma Mater**: Hans Raj College, University of Delhi\n- **Occupations**: Entrepreneur, Artist, Actor\n- **Entity**: https://treishvaamgroup.com/#treishvaam\n</semantic-chunk>\n\n` + text;
            return new NextResponse(merged, {
                headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Cache-Control': 'public, s-maxage=86400, max-age=3600'
                }
            });
        }

        return new NextResponse(STATIC_AI_FEED_MD, {
            status: 200,
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400'
            }
        });
    } catch (error) {
        return new NextResponse(STATIC_AI_FEED_MD, {
            status: 200,
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400'
            }
        });
    }
}