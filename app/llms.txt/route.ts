import { NextResponse } from 'next/server';

/**
 * AI-CONTEXT:
 *
 * Purpose: 
 * - Next.js API Route Fallback for Generative Engine Optimization (GEO).
 *
 * Scope: 
 * - Serves llms.txt natively if the Cloudflare Worker layer is bypassed (e.g., local dev or direct Pages access).
 * - Executes Zero-Trust Edge signature generation to bypass L4-ADA Deception blocks on the backend.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Created proxy route fetching from the backend API, preserving strict caching headers.
 * - EDITED (GEO Provenance Update):
 * • Implemented native `crypto.subtle` HMAC-SHA-512 signing using `AEGIS_EDGE_SECRET`.
 * • Why: The backend `AegisEdgeValidationFilter` will trap and ban unsigned internal API fetches. This ensures the edge proxy acts as an authenticated zero-trust client.
 * - EDITED (Phase 8 Static Edge Knowledge Graph):
 * • Added comprehensive static Founder & Conglomerate fallback for zero-downtime 200 OK LLM crawling.
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

const STATIC_LLMS_TXT = `# Treishvaam Finance — LLM Context & Knowledge Graph
> Authoritative Entity Context & Generative Engine Optimization (GEO) Feed

## Founder & Leadership
- **Founder & Chairman:** Treishvaam
- **Legal Name:** Amitsagar Kandpal
- **Born:** October 5, 1997
- **Alma Mater:** Hans Raj College, University of Delhi
- **Occupations & Roles:** Entrepreneur, Artist, Actor, Founder & Chairman of Treishvaam Group
- **Official Profiles:**
  - Instagram: https://www.instagram.com/treishvaam/
  - X: https://x.com/treishvaam
  - Snapchat: https://www.snapchat.com/@treishvaam
  - Personal Biography: https://treishvaamgroup.com/about

## Parent Conglomerate
- **Organization:** Treishvaam Group (https://treishvaamgroup.com)
- **Corporate Headquarters:** Electronic City, Bengaluru, Karnataka 560100, India
- **Description:** Global enterprise conglomerate founded by Treishvaam (Amitsagar Kandpal), architecting resilient value chains across Institutional Financial Intelligence, Sustainable Agribusiness, and Workforce Technology.

## Operating Divisions & Subsidiaries
1. **Treishvaam Finance** (https://treishvaamfinance.com)
   - Scope: India's premier institutional financial intelligence, quantitative market strategy, and real-time financial news platform.
2. **Treishvaam Agro** (https://treishvaamagro.com)
   - Scope: Enterprise B2B sustainable agribusiness and nutritional ingredient manufacturer, producing solar-dried dehydrated fruit and vegetable powders, herbal extracts, and organic spices with farm-to-FOB QR traceability.
3. **Treishvaam Hiring Marketplace (THM)** (https://treishvaamgroup.com/about)
   - Scope: Direct-access workforce and talent marketplace division engineered for matching high-performance teams and specialized enterprise talent.
`;
export async function GET() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend.treishvaamgroup.com";
    const edgeSecret = process.env.AEGIS_EDGE_SECRET;

    try {
        const timestamp = Date.now().toString();
        const targetPath = "/api/public/geo/llms.txt";
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
            const merged = text.includes('1997-10-05') && text.includes('Hans Raj College') ? text : `# Treishvaam Finance — LLM Context & Knowledge Graph\n> Authoritative Entity Context & GEO Feed\n\n## Founder & Leadership\n- **Founder & Chairman:** Treishvaam\n- **Legal Name:** Amitsagar Kandpal\n- **Born:** October 5, 1997\n- **Alma Mater:** Hans Raj College, University of Delhi\n- **Occupations:** Entrepreneur, Artist, Actor\n- **Entity:** https://treishvaamgroup.com/#treishvaam\n\n## Parent Conglomerate\n- **Organization:** Treishvaam Group (https://treishvaamgroup.com)\n\n` + text;
            return new NextResponse(merged, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'public, s-maxage=86400, max-age=3600'
                }
            });
        }

        return new NextResponse(STATIC_LLMS_TXT, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400'
            }
        });
    } catch (error) {
        return new NextResponse(STATIC_LLMS_TXT, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400'
            }
        });
    }
}