/**
 * AI-CONTEXT:
 * Purpose: Core Next.js Configuration.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Added Webpack alias for `react-router-dom` mapping to `src/utils/react-router-shim.js`.
 * - EDITED: Added async `rewrites()` to proxy `/api` and `/auth` traffic to `http://localhost:8080`.
 * • Why: Resolves ERR_NETWORK and Auth Timeouts caused by the loss of the CRA proxy configuration.
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config) => {
        config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'src/utils/react-router-shim.js');
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*'
            },
            {
                source: '/auth/:path*',
                destination: 'http://localhost:8080/auth/:path*'
            }
        ];
    }
};

export default nextConfig;