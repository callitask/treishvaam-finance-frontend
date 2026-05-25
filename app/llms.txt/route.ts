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
        const text = await res.text();

        return new NextResponse(text, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, s-maxage=86400, max-age=3600'
            }
        });
    } catch (error) {
        return new NextResponse("GEO Feed Unavailable", { status: 503 });
    }
}