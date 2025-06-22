import React from 'react';

const VisionPage = () => {
  return (
    <>
      <section className="hero-silver-gradient py-20 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold page-main-title">Our Vision for the Future</h1>
          <p className="text-lg md:text-xl page-subtitle mt-4 max-w-3xl mx-auto">To build a world where financial literacy is not a privilege, but a universal skill accessible to everyone, everywhere.</p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold section-title mb-6">The Philosophy That Drives Us</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe that understanding finance is fundamental to personal freedom and empowerment. In a world of increasing complexity, the ability to manage your finances, understand markets, and plan for the future is essential. Our vision is to break down the barriers of jargon and complexity, making sophisticated financial knowledge clear, intuitive, and actionable for all.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold section-title mb-12 text-center">Our Roadmap to the Future</h2>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-1/2 h-full w-0.5 bg-sky-200 transform -translate-x-1/2"></div>
            <div className="relative mb-12">
              <div className="absolute w-8 h-8 bg-sky-500 rounded-full left-1/2 transform -translate-x-1/2 -translate-y-4 flex items-center justify-center text-white font-bold">1</div>
              <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-4/5 mx-auto">
                <h3 className="text-xl font-semibold text-sky-700 mb-2">Interactive Learning Tools</h3>
                <p className="text-gray-600">Launching a suite of interactive tools, including budget simulators, investment calculators, and ERP system sandboxes. We aim to move beyond theory, allowing users to learn by doing in a risk-free environment.</p>
              </div>
            </div>
            <div className="relative mb-12">
              <div className="absolute w-8 h-8 bg-sky-500 rounded-full left-1/2 transform -translate-x-1/2 -translate-y-4 flex items-center justify-center text-white font-bold">2</div>
              <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-4/5 mx-auto">
                <h3 className="text-xl font-semibold text-sky-700 mb-2">Personalized Learning Paths</h3>
                <p className="text-gray-600">Developing AI-driven learning paths that adapt to each user's goals and existing knowledge. Whether you're a student, a professional, or a business owner, our platform will tailor the curriculum to you.</p>
              </div>
            </div>
            <div className="relative mb-12">
              <div className="absolute w-8 h-8 bg-sky-500 rounded-full left-1/2 transform -translate-x-1/2 -translate-y-4 flex items-center justify-center text-white font-bold">3</div>
              <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-4/5 mx-auto">
                <h3 className="text-xl font-semibold text-sky-700 mb-2">Global Community and Mentorship</h3>
                <p className="text-gray-600">Fostering a global community where learners can connect with peers and access mentorship from experienced financial professionals. We believe collaborative learning accelerates growth and builds confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export default VisionPage;
