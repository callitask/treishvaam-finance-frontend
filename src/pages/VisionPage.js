import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Cpu, Globe, TrendingUp } from 'lucide-react';

const VisionPage = () => {
    const roadmap = [
        {
            id: 1,
            title: "Interactive Learning Tools",
            desc: "Launching a suite of interactive tools, including budget simulators, investment calculators, and ERP system sandboxes. We aim to move beyond theory, allowing users to learn by doing in a risk-free environment.",
            icon: <Cpu className="w-6 h-6 text-white" />,
            color: "from-blue-500 to-cyan-500"
        },
        {
            id: 2,
            title: "Personalized Learning Paths",
            desc: "Developing AI-driven learning paths that adapt to each user's goals. Whether you're a student, professional, or business owner, our platform will tailor the curriculum specifically to your financial maturity.",
            icon: <Target className="w-6 h-6 text-white" />,
            color: "from-indigo-500 to-purple-500"
        },
        {
            id: 3,
            title: "Global Community & Mentorship",
            desc: "Fostering a borderless community where learners connect with peers and access mentorship from experienced professionals. We believe collaborative learning accelerates growth and builds lasting confidence.",
            icon: <Globe className="w-6 h-6 text-white" />,
            color: "from-rose-500 to-pink-500"
        }
    ];

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Our Vision - Treishvaam Finance",
        "description": "To build a world where financial literacy is a universal skill. Explore our roadmap: Interactive Tools, AI Learning, and Global Community.",
        "publisher": {
            "@type": "Organization",
            "name": "Treishvaam Finance"
        }
    };

    return (
        <>
            <Helmet>
                <title>Our Vision | Treishvaam Finance</title>
                <meta name="description" content="We envision a world where financial literacy is universal. Explore our roadmap to interactive education and global mentorship." />
                <link rel="canonical" href="https://treishfin.treishvaamgroup.com/vision" />
                <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
            </Helmet>

            {/* --- Hero Section --- */}
            <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-24 text-center px-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
                    The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Finance</span>
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    To build a world where financial literacy is not a privilege, but a universal skill accessible to everyone, everywhere.
                </p>
            </section>

            {/* --- Philosophy Section --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <TrendingUp className="w-12 h-12 text-sky-600 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-slate-900 mb-8 font-serif">The Philosophy That Drives Us</h2>
                        <p className="text-xl text-slate-600 leading-loose font-light font-serif italic">
                            "We believe that understanding finance is fundamental to personal freedom. In a world of increasing complexity, the ability to manage your finances, understand markets, and plan for the future is essential. We exist to break down the barriers of jargon, making sophisticated financial knowledge clear, intuitive, and actionable."
                        </p>
                    </div>
                </div>
            </section>

            {/* --- Roadmap Section --- */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">Roadmap to the Future</h2>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Vertical Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 transform md:-translate-x-1/2"></div>

                        <div className="space-y-12">
                            {roadmap.map((item, index) => (
                                <div key={item.id} className={`relative flex items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                    {/* Icon Bubble */}
                                    <div className={`absolute left-0 md:left-1/2 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center shadow-lg z-10 transform md:-translate-x-1/2`}>
                                        <div className="scale-75 md:scale-100">{item.icon}</div>
                                    </div>

                                    {/* Content Card */}
                                    <div className={`ml-12 md:ml-0 md:w-[45%] bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group`}>
                                        <div className={`text-xs font-bold uppercase tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-r ${item.color}`}>
                                            Phase {item.id}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-sky-700 transition-colors">{item.title}</h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Spacer for the other side */}
                                    <div className="hidden md:block md:w-[45%]"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default VisionPage;