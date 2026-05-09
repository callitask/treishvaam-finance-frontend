/**
 * AI-CONTEXT:
 * Purpose: Restores Tailwind CSS compilation pipeline.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Next.js compliant PostCSS configuration in object format.
 * • Why: Resolves "Malformed PostCSS Configuration" and restores Tailwind generation.
 */
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};