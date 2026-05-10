/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router layout for all dashboard routes.
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Injected the DashboardLayout component to persist the sidebar across all /dashboard sub-routes.
 */
import React from 'react';
import DashboardLayout from '../../src/layouts/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}