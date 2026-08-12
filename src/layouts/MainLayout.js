// src/layouts/MainLayout.js
/**
 * AI-CONTEXT:
 * Purpose: Core shell layout for public and protected routes.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 4 - Enterprise UI): 
 * • Swapped `bg-gray-50` to `bg-slate-50` to maintain absolute palette cohesion across the entire Next.js application.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <Navbar />
      <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 min-h-screen">
        <Outlet />
      </main>
      <Footer className="hidden sm:block" />
    </div>
  );
};

export default MainLayout;