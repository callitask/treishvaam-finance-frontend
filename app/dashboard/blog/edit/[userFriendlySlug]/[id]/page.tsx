import React from 'react';

// AI-CONTEXT: Satisfies the Next.js static export compiler for dynamic Client-Side routes
export function generateStaticParams() {
    return [];
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}