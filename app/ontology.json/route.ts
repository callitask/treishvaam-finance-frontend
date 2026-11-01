import { NextResponse } from 'next/server';
import { getStaticFounderAndConglomerateGraph } from '../../src/utils/schemaGenerator';

/**
 * AI-CONTEXT:
 *
 * Purpose: 
 * - Next.js API Route Fallback for Generative Engine Optimization (GEO).
 *
 * Scope: 
 * - Serves ontology.json natively if the Cloudflare Worker layer is bypassed.
 * - Executes Zero-Trust Edge signature generation to bypass L4-ADA Deception blocks on the backend.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Created proxy route for absolute JSON-LD data footprint.
 * - EDITED (GEO Provenance Update):
 * • Implemented native `crypto.subtle` HMAC-SHA-512 signing using `AEGIS_EDGE_SECRET`.
 * • Why: Validates the request with the backend `AegisEdgeValidationFilter` to maintain zero-trust integrity.
 * - EDITED (Phase 8 Static Edge Knowledge Graph):
 * • Added static Founder & Conglomerate fallback via `getStaticFounderAndConglomerateGraph()` when backend origin is offline/unreachable.
 * • Why: Guarantees zero-downtime 200 OK JSON-LD for Google Knowledge Graph and AI crawlers.
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
        const targetPath = "/api/public/geo/ontology.json";
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
            const data = await res.json();
            const staticGraph = getStaticFounderAndConglomerateGraph();
            let merged = data;
            if (data && Array.isArray(data['@graph'])) {
                const existingIds = new Set(data['@graph'].map((n: any) => n['@id']));
                for (const node of staticGraph['@graph']) {
                    if (!existingIds.has(node['@id'])) {
                        data['@graph'].push(node);
                    }
                }
                merged = data;
            } else {
                merged = staticGraph;
            }

            return NextResponse.json(merged, {
                status: 200,
                headers: {
                    'Content-Type': 'application/ld+json; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600, s-maxage=86400'
                }
            });
        }

        return NextResponse.json(getStaticFounderAndConglomerateGraph(), {
            status: 200,
            headers: {
                'Content-Type': 'application/ld+json; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400'
            }
        });
    } catch (error) {
        return NextResponse.json(getStaticFounderAndConglomerateGraph(), {
            status: 200,
            headers: {
                'Content-Type': 'application/ld+json; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400'
            }
        });
    }
}