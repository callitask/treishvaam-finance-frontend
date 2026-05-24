import { NextResponse } from 'next/server';

/**
 * AI-CONTEXT:
 *
 * Purpose: 
 * - Next.js API Route Fallback for Generative Engine Optimization (GEO).
 *
 * Scope: 
 * - Serves llms.txt natively if the Cloudflare Worker layer is bypassed (e.g., local dev or direct Pages access).
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Created proxy route fetching from the backend API, preserving strict caching headers.
 */

export const runtime = 'edge';

export async function GET() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend.treishvaamgroup.com";
    try {
        const res = await fetch(`${backendUrl}/api/public/geo/llms.txt`, {
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