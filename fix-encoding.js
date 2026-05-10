const fs = require('fs');
const path = require('path');

const fileDef = {
    path: 'app/terms/page.tsx',
    content: `"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for Terms Page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Fixed UTF encoding via script.
 */
import TermsPage from '../../src/pages/TermsPage';
export default function Page() { return <TermsPage />; }
`
};

const fullPath = path.join(__dirname, fileDef.path);
try {
    fs.writeFileSync(fullPath, fileDef.content, { encoding: 'utf8', mode: 0o644 });
    console.log(`✅ Successfully fixed encoding for: ${fileDef.path}`);
} catch (err) {
    console.error(`❌ Failed to write ${fileDef.path}:`, err);
}