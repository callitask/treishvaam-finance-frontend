/**
 * AI-CONTEXT:
 *
 * Purpose: Render the API Status Dashboard Page.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Initial API Status Page wrapper for ApiStatusPanel.
 * - EDITED: Injected showHistory={true} prop to trigger full interval logging.
 * - EDITED (Phase 7 - Cloudflare UI Overhaul):
 * • Converted layout to high-density, monochromatic slate palette to match the Cloudflare Radar aesthetic.
 * • Enforced strictly left-aligned text blocks, 1px borders, and minimalistic spacing.
 */
import React from 'react';
import ApiStatusPanel from '../components/ApiStatusPanel';
import { FaServer } from 'react-icons/fa';

const ApiStatusPage = () => {
    return (
        <div className="container mx-auto p-4 md:p-8 bg-white min-h-screen text-slate-900 font-sans">
            <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 pb-4">
                <FaServer className="text-blue-600 text-xl" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">API Health & Telemetry</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Real-time gateway connectivity logs.</p>
                </div>
            </div>
            
            <div className="max-w-[1200px]">
                <ApiStatusPanel showHistory={true} />
            </div>
        </div>
    );
};

export default ApiStatusPage;