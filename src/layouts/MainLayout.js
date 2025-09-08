import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;