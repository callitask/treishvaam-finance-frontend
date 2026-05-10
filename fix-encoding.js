const fs = require('fs');
const path = require('path');

const filesToFix = [
    {
        path: 'app/dashboard/api-status/page.tsx',
        content: `"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for API Status page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Fixed UTF encoding via script.
 */
import ApiStatusPage from '../../../src/pages/ApiStatusPage';
export default function Page() { return <ApiStatusPage />; }
`
    },
    {
        path: 'app/dashboard/audience/page.tsx',
        content: `"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for Audience page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Fixed UTF encoding via script.
 */
import AudiencePage from '../../../src/pages/AudiencePage';
export default function Page() { return <AudiencePage />; }
`
    },
    {
        path: 'app/dashboard/blog/new/page.tsx',
        content: `"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for new Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Fixed UTF encoding via script.
 */
import BlogEditorPage from '../../../../src/pages/BlogEditorPage';
export default function Page() { return <BlogEditorPage />; }
`
    },
    {
        path: 'app/dashboard/profile/page.tsx',
        content: `"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for Profile page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Fixed UTF encoding via script.
 */
import ProfilePage from '../../../src/pages/ProfilePage';
export default function Page() { return <ProfilePage />; }
`
    },
    {
        path: 'app/privacy/page.tsx',
        content: `"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for Privacy Page.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Fixed UTF encoding via script.
 */
import PrivacyPage from '../../src/pages/PrivacyPage';
export default function Page() { return <PrivacyPage />; }
`
    }
];

filesToFix.forEach(fileDef => {
    const fullPath = path.join(__dirname, fileDef.path);
    try {
        // Write the file explicitly as utf8
        fs.writeFileSync(fullPath, fileDef.content, { encoding: 'utf8', mode: 0o644 });
        console.log(`✅ Successfully fixed encoding for: ${fileDef.path}`);
    } catch (err) {
        console.error(`❌ Failed to write ${fileDef.path}:`, err);
    }
});