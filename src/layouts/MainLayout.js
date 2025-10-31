import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 min-h-screen">
        <Outlet />
      </main>

      {/* --- MODIFIED: Added 'hidden' and 'sm:block' classes --- */}
      {/* This hides the footer on mobile (default) and shows it on screens 'sm' and larger. */}
      <Footer className="hidden sm:block" />
    </>
  );
};

export default MainLayout;