const HomePage = () => {
    const [latestPostTitle, setLatestPostTitle] = useState('');

    useEffect(() => {
        const fetchLatestHeadline = async () => {
            try {
                const response = await getLatestPostHeadline();
                if (response.data && response.data.title) {
                    setLatestPostTitle(response.data.title);
                }
            } catch (error) {
                console.error("Failed to fetch latest post headline:", error);
            }
        };

        fetchLatestHeadline();
    }, []);

    const defaultTitle = "Treishfin | Daily Financial News, Market Updates & Analysis";
    const defaultDescription = "Your trusted source for daily financial news, market updates, and expert analysis.";
    const dynamicDescription = latestPostTitle || defaultDescription;

    return (
        <>
            <Helmet>
                <title>{defaultTitle}</title>
                <meta name="description" content={dynamicDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://treishfin.treishvaamgroup.com/" />
                <meta property="og:title" content={defaultTitle} />
                <meta property="og:description" content={dynamicDescription} />
                <meta property="og:image" content="https://treishfin.treishvaamgroup.com/logo512.png" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://treishfin.treishvaamgroup.com/" />
                <meta property="twitter:title" content={defaultTitle} />
                <meta property="twitter:description" content={dynamicDescription} />
                <meta property="twitter:image" content="https://treishfin.treishvaamgroup.com/logo512.png" />
            </Helmet>
            <section className="hero-silver-gradient py-20 md:py-32 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight page-main-title">Treish your Finance.</h1>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto page-subtitle">Access expert-led educational content and structured learning paths to build your financial confidence.</p>
                    <Link to="/education" className="cta-button-primary text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-105">Explore Our Courses</Link>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold section-title mb-4">Why Learn with Treishvaam Finance?</h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">A trusted resource for clear, reliable, and insightful financial education.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                        <div className="bg-gray-50 p-8 rounded-xl shadow-lg text-center service-card">
                            <div className="flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6 mx-auto">
                                <ExpertIcon className="h-8 w-8 text-sky-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Expert-Led Content</h3>
                            <p className="text-gray-600">Learn from industry professionals with deep market knowledge and practical experience.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-xl shadow-lg text-center service-card">
                            <div className="flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6 mx-auto">
                                <StructuredIcon className="h-8 w-8 text-sky-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Structured Learning</h3>
                            <p className="text-gray-600">Our modules are designed to guide you from fundamental concepts to advanced topics seamlessly.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-xl shadow-lg text-center service-card">
                            <div className="flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6 mx-auto">
                                <SecureIcon className="h-8 w-8 text-sky-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Secure Platform</h3>
                            <p className="text-gray-600">Access your educational materials and track your progress on our reliable and secure learning portal.</p>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/about" className="font-semibold text-lg hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More About Us →</Link>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-sky-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold section-title mb-4">Our Core Learning Modules</h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">We offer a wide range of financial courses to meet your diverse educational needs.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                                <InvestingIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Investing Fundamentals</h3>
                            <p className="text-gray-600 mb-4 flex-grow">Build a strong foundation with our modules on stocks, bonds, and market basics.</p>
                            <Link to="/education" className="font-semibold mt-auto hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More →</Link>
                        </div>
                        <div className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                                <AnalysisIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Advanced Market Analysis</h3>
                            <p className="text-gray-600 mb-4 flex-grow">Explore technical and fundamental analysis techniques to evaluate opportunities.</p>
                            <Link to="/education" className="font-semibold mt-auto hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More →</Link>
                        </div>
                        <div className="service-card bg-white p-8 rounded-xl shadow-lg flex flex-col text-center">
                            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                                <RetirementIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold section-title mb-3">Retirement Education</h3>
                            <p className="text-gray-600 mb-4 flex-grow">Learn about the different retirement accounts and strategies for long-term saving.</p>
                            <Link to="/education" className="font-semibold mt-auto hover:text-sky-600 transition" style={{ color: 'var(--primary-medium)' }}> Learn More →</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;