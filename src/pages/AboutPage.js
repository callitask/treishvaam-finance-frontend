import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// --- Icon Components (Cleaned and separated for clarity) ---
const IntegrityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LearnerFocusedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ExpertiseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.002 12.083 12.083 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.002 12.083 12.083 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V16" /></svg>;
const ClarityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

const coreValues = [
    {
        icon: <IntegrityIcon />,
        title: "Integrity",
        description: "Upholding the highest ethical standards in our educational content and market analysis.",
    },
    {
        icon: <LearnerFocusedIcon />,
        title: "Community-Focused",
        description: "Placing our community's financial literacy and empowerment at the forefront of all we do.",
    },
    {
        icon: <ExpertiseIcon />,
        title: "Data-Driven Expertise",
        description: "Leveraging deep market knowledge and analytical strategies to provide actionable insights.",
    },
    {
        icon: <ClarityIcon />,
        title: "Simplicity & Clarity",
        description: "Communicating complex financial topics with transparency and ease of understanding.",
    },
];

const AboutPage = () => {
    return (
        <>
            {/* --- Compact Hero Section --- */}
            <section className="hero-silver-gradient py-16 md:py-20">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Treish Your Finance!
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-gray-700 mt-2 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                        A visionary journey from sales and marketing to the world of finance.
                    </p>
                    <div className="flex flex-col items-center justify-center mt-8">
                        <div className="w-32 h-32 rounded-full bg-gray-200 shadow-lg mb-4 flex items-center justify-center overflow-hidden border-4 border-sky-100">
                            <LazyLoadImage
                                src="/amitsagar-kandpal-photo.png"
                                alt="Amitsagar Kandpal, Founder of Treishvaam Finance"
                                className="object-cover w-full h-full"
                                effect="blur"
                                wrapperClassName="w-full h-full"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-sky-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Amitsagar Kandpal <span className="text-lg font-semibold text-sky-600">(Treishvaam)</span></h2>
                        <p className="text-base text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Founder, Treishvaam Finance</p>
                        <a href="https://www.linkedin.com/in/amitsagarkandpal" target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-full font-semibold shadow-md hover:bg-blue-700 transition-colors duration-300">
                            Connect on LinkedIn
                        </a>
                    </div>
                </div>
            </section>

            {/* --- Symmetrical Three-Column Section --- */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-3 gap-8 items-stretch">

                        {/* Column 1: Our Story */}
                        <div className="flex flex-col bg-gray-50 p-8 rounded-xl shadow-md border border-gray-100">
                            <h2 className="text-3xl font-bold text-sky-900 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Our Story</h2>
                            <div className="text-gray-700 space-y-4 flex-grow" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <p>
                                    <strong>Treishvaam Finance</strong>, a visionary venture by its founder, was born from a journey that began in the competitive arenas of sales and marketing at Career Launcher. This foundation in business strategy and client relations provided a unique perspective when transitioning into the dynamic world of financial markets.
                                </p>
                                <p>
                                    Today, based in Bengaluru, we stand as a beacon for financial literacy. Our core mission is to empower our audience with timely news, insightful analysis, and the knowledge to understand how global events impact the financial world. We are dedicated to making finance accessible and actionable for everyone.
                                </p>
                            </div>
                        </div>

                        {/* Column 2: The Founder's Journey */}
                        <div className="flex flex-col bg-gray-50 p-8 rounded-xl shadow-md border border-gray-100">
                            <h2 className="text-3xl font-bold text-sky-900 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>The Founder's Journey</h2>
                            <div className="text-gray-700 space-y-4 flex-grow" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <p>
                                    The expertise behind Treishvaam Finance comes from its founder, <strong>Treishvaam</strong>, a Computer Science graduate from Hansraj College, University of Delhi. His professional path started at Career Launcher, where he honed skills in project leadership, team mentorship, and strategic marketing.
                                </p>
                                <p>
                                    This business acumen was then fused with a deep passion for the financial markets. Treishvaam developed a proficiency in advanced trading methodologies, including Smart Money Concepts (SMC), the Wyckoff Method, and Price Action analysis. This powerful combination of strategic thinking and market expertise is the driving force behind our commitment to delivering clear, data-driven insights.
                                </p>
                            </div>
                        </div>

                        {/* Column 3: Our Core Values */}
                        <div className="flex flex-col bg-gray-50 p-8 rounded-xl shadow-md border border-gray-100">
                            <h2 className="text-3xl font-bold text-sky-900 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Our Core Values</h2>
                            <div className="space-y-5 mt-2 flex-grow">
                                {coreValues.map((value) => (
                                    <div key={value.title} className="flex items-start">
                                        <div className="flex-shrink-0 text-sky-600 mt-1">
                                            {value.icon}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{value.title}</h3>
                                            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>{value.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutPage;