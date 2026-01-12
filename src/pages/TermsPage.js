import React from 'react';
import { Helmet } from 'react-helmet-async';

const TermsPage = () => {
    const pageTitle = "Terms of Service | Treishvaam Finance";
    const pageDescription = "Review the Terms of Service for Treishvaam Finance. Understand the rules, regulations, and disclaimers governing the use of our financial education platform.";
    const pageUrl = "https://treishfin.treishvaamgroup.com/terms";
    const imageUrl = "https://treishfin.treishvaamgroup.com/logo.webp";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pageTitle,
        "description": pageDescription,
        "url": pageUrl,
        "publisher": {
            "@type": "Organization",
            "name": "Treishvaam Finance",
            "logo": {
                "@type": "ImageObject",
                "url": imageUrl
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={pageUrl} />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:url" content={pageUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={imageUrl} />

                {/* Schema */}
                <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
            </Helmet>

            <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <p className="text-gray-500 mb-8 text-sm">Last Updated: January 2026</p>

                <div className="prose prose-slate max-w-none text-gray-600 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">1. Agreement to Terms</h2>
                        <p>
                            By accessing our website at Treishfin (treishfin.treishvaamgroup.com), you agree to be bound by these terms of service,
                            all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">2. Educational Disclaimer</h2>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                            <p className="text-blue-900 font-medium">
                                The content provided on Treishfin is for educational and informational purposes only. It does not constitute financial, investment, or legal advice.
                            </p>
                        </div>
                        <p className="mt-4">
                            We are not financial advisors. You should consult with a qualified professional before making any financial decisions.
                            Treishfin and its authors are not liable for any losses or damages arising from your use of the information provided on this website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">3. Use License</h2>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on Treishfin for personal,
                            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>Attempt to decompile or reverse engineer any software contained on Treishfin;</li>
                            <li>Remove any copyright or other proprietary notations from the materials; or</li>
                            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">4. Accuracy of Materials</h2>
                        <p>
                            The materials appearing on Treishfin could include technical, typographical, or photographic errors.
                            We do not warrant that any of the materials on our website are accurate, complete, or current.
                            We may make changes to the materials contained on our website at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">5. Links</h2>
                        <p>
                            Treishfin has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.
                            The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">6. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably
                            submit to the exclusive jurisdiction of the courts in that location.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;