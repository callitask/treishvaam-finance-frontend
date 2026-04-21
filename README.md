/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Master documentation for the Treishvaam Group Next.js Frontend (Parent Website).
 *
 * Scope:
 * - Covers Next.js App Router architecture, deployment instructions, and Zero-Trust environment configurations.
 *
 * Security Constraints:
 * - Tracking IDs and API Origins MUST NOT be hardcoded. They must be injected via NEXT_PUBLIC_* variables.
 *
 * Non-Negotiables:
 * - Third-party scripts must utilize interaction-based deferred loading for a 0ms TBT score.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Initial Next.js README boilerplate.
 * - EDITED:
 * • Merged legacy QUICKSTART.md into this file to eliminate documentation fragmentation.
 * • Documented App Router structure and Tailwind CSS configurations.
 * - EDITED:
 * • Integrated Phase 4 Zero-Trust protocols.
 * • Documented `NEXT_PUBLIC_*` environment variables for GA4, Ads, and AdSense.
 * • Enforced 0ms TBT Architecture via `ThirdPartyScripts.tsx`.
 */

# Treishvaam Group Frontend (Next.js)

The Treishvaam Group Frontend is a high-performance, enterprise-grade Next.js application utilizing the App Router paradigm. It serves as the primary corporate portal, designed for immaculate SEO, accessibility, and zero-trust security.

## 1. Security & Configuration (Zero Trust)

**Fort Knox Security Suite: ENABLED**
This project strictly follows the **12-Factor App** configuration methodology. All production URLs and Tracking IDs are hidden from the codebase and injected strictly at runtime via Cloudflare Pages environment variables.

### Environment Variables
The application requires the following variables to function securely.

| Variable Name | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The URL of the Spring Boot Backend. | **Yes** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (`G-XXX`). | No |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense Publisher ID (`ca-pub-XXX`). | No |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads Tracking ID (`AW-XXX`). | No |

## 2. Architecture Highlights

* **Next.js 15 App Router**: Utilizes React Server Components (RSC) by default for zero-bundle-size SEO content delivery.
* **0ms TBT Analytics Loading**: Google Analytics, Google Ads, and AdSense scripts are strictly loaded via an **Interaction-Based Deferred Strategy** (`components/ThirdPartyScripts.tsx`). This ensures a 100/100 Lighthouse Performance score by preventing third-party code from blocking the main thread during Googlebot crawls.
* **Dynamic SEO**: `app/sitemap.ts` and `app/robots.ts` programmatically generate the SEO foundation, automatically adapting to the deployed environment.
* **Enterprise Design System**: Tailwind CSS 3 is heavily customized via `tailwind.config.ts` to strictly adhere to the Corporate Navy and Heritage Gold color palettes.

## 3. Project Structure

```text
src/ (or root)
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Root layout (Metadata, Providers, Navbar, Footer)
│   ├── page.tsx           # Homepage
│   ├── about/             # About Us section
│   ├── sitemap.ts         # Dynamic XML Sitemap generator
│   └── robots.ts          # Dynamic robots.txt generator
├── components/            # Reusable React Components
│   ├── layout/            # Navbar, Footer
│   ├── home/              # Homepage specific sections
│   ├── ui/                # Core design system elements (Button, Card, Section)
│   ├── ThirdPartyScripts.tsx # Zero-Trust interaction-based script loader
│   └── GoogleAdSense.tsx  # Dynamic AdSense injection block
├── public/                # Static assets (images, fonts, ads.txt)
└── .env.local             # Local development secrets (Git-ignored)
```

## 4. Installation & Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### First Time Setup
```bash
# Install dependencies
npm install

# Create local environment variables
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8080

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 5. Deployment (Cloudflare Pages)

We use Cloudflare Pages for hosting to ensure global edge distribution and security.

1.  **Push** your code to the designated branch.
2.  **Go to Cloudflare Dashboard** -> Workers & Pages -> treishvaamgroup-frontend -> Settings -> Environment Variables.
3.  **Add the Production Variables** (e.g., `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`).
4.  **Redeploy** to apply changes.

## 6. Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## License
Proprietary software. All rights reserved by Treishvaam Group.