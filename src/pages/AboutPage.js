import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const AboutPage = () => {
    const IntegrityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m0-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
    const LearnerFocusedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const ExpertiseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;
    const ClarityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>;

    return (
      <>
        <section className="hero-silver-gradient py-20 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold page-main-title">About Treishvaam Finance</h1>
            <p className="text-lg md:text-xl page-subtitle mt-4 max-w-2xl mx-auto">Your trusted partner in financial education, committed to clarity and empowerment.</p>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold section-title mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At Treishvaam Finance, our mission is to empower individuals with the knowledge and tools needed to navigate the complexities of the financial world. We strive to foster financial literacy and promote informed decision-making through accessible, high-quality educational content.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold section-title mb-8 text-center">Our Story</h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>Founded on the principles of clarity and accessibility, Treishvaam Finance emerged from a desire to demystify finance for everyone. We saw a need for an educational platform that builds a strong foundation of financial knowledge, free from jargon and complex advice.</p>
                <p>Our journey began with a small team of passionate financial educators. Over the years, we've grown by adapting to the ever-changing financial landscape, but our core commitment to our learners' understanding has remained unwavering. We leverage clear teaching methods and deep market insights to deliver educational content that is both innovative and easy to grasp.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold section-title mb-12 text-center">Meet Our Educators (Example)</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center service-card">
                <LazyLoadImage alt="Team Member 1" effect="blur" src="https://placehold.co/150x150/E0F2FE/0369a1?text=Lead" className="w-32 h-32 rounded-full mx-auto mb-4 border-4" style={{ borderColor: 'var(--primary-pale)' }} />
                <h3 className="text-xl font-semibold" style={{ color: 'var(--primary-darker)' }}>Dr. Anya Sharma</h3>
                <p style={{ color: 'var(--primary-dark)' }}>Founder & Lead Educator</p>
                <p className="text-sm text-gray-500 mt-2">With over 20 years in financial markets, Dr. Sharma leads our educational content creation with unparalleled expertise.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center service-card">
                <LazyLoadImage alt="Team Member 2" effect="blur" src="https://placehold.co/150x150/BAE6FD/0369a1?text=Analyst" className="w-32 h-32 rounded-full mx-auto mb-4 border-4" style={{ borderColor: 'var(--primary-pale)' }} />
                <h3 className="text-xl font-semibold" style={{ color: 'var(--primary-darker)' }}>Rajiv Patel</h3>
                <p style={{ color: 'var(--primary-dark)' }}>Head of Market Analysis Content</p>
                <p className="text-sm text-gray-500 mt-2">Rajiv's analytical prowess helps distill complex market data into understandable educational insights.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center service-card">
                <LazyLoadImage alt="Team Member 3" effect="blur" src="https://placehold.co/150x150/E0F2FE/0284c7?text=Support" className="w-32 h-32 rounded-full mx-auto mb-4 border-4" style={{ borderColor: 'var(--primary-pale)' }} />
                <h3 className="text-xl font-semibold" style={{ color: 'var(--primary-darker)' }}>Priya Singh</h3>
                <p style={{ color: 'var(--primary-dark)' }}>Learner Support Lead</p>
                <p className="text-sm text-gray-500 mt-2">Priya ensures every learner has the support and resources they need for a successful educational journey.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold section-title mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center"><div className="value-icon-bg value-icon-text flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"><IntegrityIcon /></div><h3 className="text-xl font-semibold section-title mb-2">Integrity</h3><p className="text-gray-600 text-sm">Upholding the highest ethical standards in our educational content and interactions.</p></div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center"><div className="value-icon-bg value-icon-text flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"><LearnerFocusedIcon /></div><h3 className="text-xl font-semibold section-title mb-2">Learner-Focused</h3><p className="text-gray-600 text-sm">Placing our learners' educational needs and understanding at the forefront of all we do.</p></div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center"><div className="value-icon-bg value-icon-text flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"><ExpertiseIcon /></div><h3 className="text-xl font-semibold section-title mb-2">Expertise</h3><p className="text-gray-600 text-sm">Continuously enhancing our knowledge to provide insightful and effective educational content.</p></div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center"><div className="value-icon-bg value-icon-text flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"><ClarityIcon /></div><h3 className="text-xl font-semibold section-title mb-2">Clarity</h3><p className="text-gray-600 text-sm">Communicating openly and clearly, ensuring our learners understand complex financial topics.</p></div>
            </div>
          </div>
        </section>
      </>
    );
  }
export default AboutPage;
